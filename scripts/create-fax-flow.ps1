<#
.SYNOPSIS
    Creates the Somnatek fax line contact flow, claims a second 404 number,
    associates the number with the fax flow, and uploads the fax audio prompt.

    This is a separate number from the main IVR line. It should appear on the
    Somnatek site as the clinic fax number. Callers hear CNG/CED tones, a brief
    V.21 preamble noise, and then morse code for "413" embedded in static.

.PREREQUISITES
    1. SomnatekPhoneStack deployed (Connect instance must exist).
    2. Audio file generated: assets/audio/somnatek-fax-line.wav
       Run: node scripts/generate-fax-audio.js
    3. AWS profile configured: somnatek-arg

.USAGE
    $env:AWS_PROFILE = "somnatek-arg"
    .\scripts\create-fax-flow.ps1

.NOTES
    Amazon Connect prompts must be uploaded via the AWS CLI or console.
    The contact flow plays the prompt and disconnects — no Lambda needed.

.FUTURE — Twilio outbound fax (not yet implemented)
    When Twilio is added:
    - Provision a Twilio fax-capable number (same area code if possible)
    - This same inbound number can stay on Connect for the "broken fax" experience
    - The Twilio number is listed separately on the site as a "second fax line"
      or the records request form targets Twilio directly
    - Lambda `fax-sender` accepts: { faxNumber, caseReference }
    - Validates caseReference against DynamoDB (must be a valid VIS-XXXXX)
    - Sends PDF via Twilio Fax API: s3://somnatek-assets/fax/protocol-7a-p3.pdf
    - PDF fax header shows sending number as the Connect fax number, timestamp 2013
    - Rate limit: one fax per VIS-XXXXX per 24 hours
    - Cost estimate: ~$1/month Twilio number + $0.01/page per transmission
#>

param(
    [string]$InstanceId = "",
    [string]$Profile    = "somnatek-arg",
    [string]$AudioPath  = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Resolve instance ID ────────────────────────────────────────────────────────
if (-not $InstanceId) {
    Write-Host "Looking up Connect instance ID from CloudFormation outputs..."
    $raw = aws cloudformation describe-stacks `
        --stack-name SomnatekPhoneStack `
        --query "Stacks[0].Outputs[?OutputKey=='ConnectInstanceId'].OutputValue" `
        --output text `
        --profile $Profile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Could not get instance ID: $raw" }
    $InstanceId = $raw.Trim()
}
if (-not $InstanceId) { throw "InstanceId is empty. Deploy SomnatekPhoneStack first." }
Write-Host "Connect instance ID: $InstanceId"

# ── Resolve audio path ─────────────────────────────────────────────────────────
if (-not $AudioPath) {
    $AudioPath = Join-Path $PSScriptRoot "..\assets\audio\somnatek-fax-line.wav"
}
$AudioPath = Resolve-Path $AudioPath
if (-not (Test-Path $AudioPath)) {
    throw "Audio file not found: $AudioPath`nRun: node scripts/generate-fax-audio.js"
}
Write-Host "Audio file: $AudioPath"

# ── Upload prompt to Connect ───────────────────────────────────────────────────
Write-Host "Uploading fax audio prompt to Connect..."
$promptRaw = aws connect create-prompt `
    --instance-id $InstanceId `
    --name "somnatek-fax-line" `
    --s3-uri "" `
    --profile $Profile 2>&1

# Connect prompts can't be uploaded directly via CLI create-prompt with a local file.
# We upload via the Connect console URL or use the start-attached-file-upload API.
# For now, print the manual step and the instance ARN.
Write-Host ""
Write-Host "──────────────────────────────────────────────────────────────────"
Write-Host "MANUAL STEP: Upload the fax audio prompt in the Connect console."
Write-Host ""
Write-Host "  1. Open: https://us-east-1.console.aws.amazon.com/connect/v2/app/instances/$InstanceId/prompts"
Write-Host "  2. Click 'Create prompt'"
Write-Host "  3. Name: somnatek-fax-line"
Write-Host "  4. Upload file: $AudioPath"
Write-Host "  5. Note the Prompt ARN — you'll need it below."
Write-Host "──────────────────────────────────────────────────────────────────"
Write-Host ""

$promptArn = Read-Host "Paste the Prompt ARN (or press Enter to skip flow creation)"
if (-not $promptArn) {
    Write-Host "Skipping flow creation. Re-run after uploading the prompt."
    exit 0
}

# ── Build fax contact flow JSON ────────────────────────────────────────────────
$ID = @{
    play       = "00000000-0000-0000-0000-000000000101"
    disconnect = "00000000-0000-0000-0000-000000000199"
}

$flowObj = [ordered]@{
    Version     = "2019-10-30"
    StartAction = $ID.play
    Actions     = @(
        [ordered]@{
            Identifier  = $ID.play
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Media = [ordered]@{
                    Uri  = $promptArn
                    Type = "Prompt"
                }
            }
            Transitions = [ordered]@{ NextAction = $ID.disconnect }
        },
        [ordered]@{
            Identifier  = $ID.disconnect
            Type        = "DisconnectParticipant"
            Parameters  = [ordered]@{}
            Transitions = [ordered]@{}
        }
    )
}

$flowJson = $flowObj | ConvertTo-Json -Depth 20 -Compress

# ── Create or update the fax contact flow ─────────────────────────────────────
Write-Host "Creating fax contact flow..."

# Check if the flow already exists
$existingFlowArn = aws connect list-contact-flows `
    --instance-id $InstanceId `
    --contact-flow-types CONTACT_FLOW `
    --query "ContactFlowSummaryList[?Name=='somnatek-fax-line'].Arn | [0]" `
    --output text `
    --profile $Profile 2>&1

if ($existingFlowArn -and $existingFlowArn -ne "None") {
    Write-Host "Flow exists ($existingFlowArn) — updating content..."
    aws connect update-contact-flow-content `
        --instance-id $InstanceId `
        --contact-flow-id $existingFlowArn `
        --content $flowJson `
        --profile $Profile | Out-Null
    $flowArn = $existingFlowArn
} else {
    $createRaw = aws connect create-contact-flow `
        --instance-id $InstanceId `
        --name "somnatek-fax-line" `
        --type CONTACT_FLOW `
        --content $flowJson `
        --profile $Profile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed to create fax flow: $createRaw" }
    $flowArn = ($createRaw | ConvertFrom-Json).ContactFlowArn
}

Write-Host "Fax contact flow ARN: $flowArn"

# ── Claim a 404 phone number ───────────────────────────────────────────────────
Write-Host ""
Write-Host "Searching for available 404 numbers..."
$numbersRaw = aws connect search-available-phone-numbers `
    --target-arn "arn:aws:connect:us-east-1:$(aws sts get-caller-identity --query Account --output text --profile $Profile):instance/$InstanceId" `
    --phone-number-country-code US `
    --phone-number-type DID `
    --phone-number-prefix "+1404" `
    --max-results 5 `
    --profile $Profile 2>&1

if ($LASTEXITCODE -ne 0) { throw "Failed to search numbers: $numbersRaw" }
$numbers = ($numbersRaw | ConvertFrom-Json).AvailableNumbersList
if (-not $numbers -or $numbers.Count -eq 0) {
    throw "No 404 DID numbers available. Try a different prefix."
}

Write-Host "Available numbers:"
for ($i = 0; $i -lt $numbers.Count; $i++) {
    Write-Host "  [$i] $($numbers[$i].PhoneNumber)"
}
$choice = Read-Host "Select number to claim [0]"
if ($choice -eq "") { $choice = "0" }
$chosenNumber = $numbers[[int]$choice].PhoneNumber
Write-Host "Claiming $chosenNumber ..."

$claimRaw = aws connect claim-phone-number `
    --target-arn "arn:aws:connect:us-east-1:$(aws sts get-caller-identity --query Account --output text --profile $Profile):instance/$InstanceId" `
    --phone-number $chosenNumber `
    --profile $Profile 2>&1
if ($LASTEXITCODE -ne 0) { throw "Failed to claim number: $claimRaw" }
$phoneNumberId = ($claimRaw | ConvertFrom-Json).PhoneNumberId
Write-Host "Claimed. PhoneNumberId: $phoneNumberId"

# Allow claim to propagate
Start-Sleep -Seconds 4

# ── Associate number with fax flow ─────────────────────────────────────────────
Write-Host "Associating $chosenNumber with fax contact flow..."
aws connect associate-phone-number-contact-flow `
    --phone-number-id $phoneNumberId `
    --instance-id $InstanceId `
    --contact-flow-id $flowArn `
    --profile $Profile | Out-Null

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════"
Write-Host "  Somnatek fax line active."
Write-Host "  Number : $chosenNumber"
Write-Host "  Flow   : $flowArn"
Write-Host ""
Write-Host "  Add this number to the Somnatek site footer and about.html as:"
Write-Host "  Facsimile: $chosenNumber"
Write-Host ""
Write-Host "  Future: Twilio outbound fax — see docs/roadmap.md Phase 1 Fax."
Write-Host "══════════════════════════════════════════════════════════════════"
