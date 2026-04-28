<#
.SYNOPSIS
    Creates the Somnatek IVR contact flow, claims a phone number, and associates them.
    Run this after `cdk deploy SomnatekPhoneStack`.

.USAGE
    $env:AWS_PROFILE = "somnatek-arg"
    .\scripts\create-contact-flow.ps1

.NOTES
    The script first validates the flow JSON by attempting to create it.
    If Connect rejects it, the full API error is printed (unlike CloudFormation
    which only says "InvalidContactFlowException").
#>

param(
    [string]$InstanceId = "",
    [string]$Profile    = "somnatek-arg"
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
Write-Host "Instance ID: $InstanceId"

# ── Build contact flow JSON ────────────────────────────────────────────────────
# Action identifiers must be valid UUIDs.
$ID = @{
    voice      = "00000000-0000-0000-0000-000000000001"
    greeting   = "00000000-0000-0000-0000-000000000002"
    ext1       = "00000000-0000-0000-0000-000000000011"
    ext2       = "00000000-0000-0000-0000-000000000012"
    ext3       = "00000000-0000-0000-0000-000000000013"
    ext4       = "00000000-0000-0000-0000-000000000014"
    fallback   = "00000000-0000-0000-0000-000000000020"
    disconnect = "00000000-0000-0000-0000-000000000099"
}

$flowObj = [ordered]@{
    Version     = "2019-10-30"
    StartAction = $ID.voice
    Actions     = @(
        # SetVoice — TextToSpeechVoice is the correct parameter name
        [ordered]@{
            Identifier  = $ID.voice
            Type        = "UpdateContactTextToSpeechVoice"
            Parameters  = [ordered]@{ TextToSpeechVoice = "Joanna" }
            Transitions = [ordered]@{ NextAction = $ID.greeting }
        },
        # DTMF menu — correct type is GetParticipantInput; conditions use Operands (array)
        [ordered]@{
            Identifier  = $ID.greeting
            Type        = "GetParticipantInput"
            Parameters  = [ordered]@{
                Text = ("You have reached Somnatek Sleep Health Center. " +
                        "Our offices are no longer in operation. " +
                        "For records and billing inquiries, press 1. " +
                        "For the research department, press 2. " +
                        "For Dr. Ellison's office, press 3. " +
                        "For all other extensions, press 4. " +
                        "To repeat these options, press 9.")
                InputTimeLimitSeconds = "8"
                StoreInput            = "False"
            }
            Transitions = [ordered]@{
                NextAction = $ID.fallback
                Conditions = @(
                    [ordered]@{ NextAction = $ID.ext1; Condition = [ordered]@{ Operator = "Equals"; Operands = @("1") } },
                    [ordered]@{ NextAction = $ID.ext2; Condition = [ordered]@{ Operator = "Equals"; Operands = @("2") } },
                    [ordered]@{ NextAction = $ID.ext3; Condition = [ordered]@{ Operator = "Equals"; Operands = @("3") } },
                    [ordered]@{ NextAction = $ID.ext4; Condition = [ordered]@{ Operator = "Equals"; Operands = @("4") } },
                    [ordered]@{ NextAction = $ID.greeting; Condition = [ordered]@{ Operator = "Equals"; Operands = @("9") } }
                )
                Errors = @(
                    [ordered]@{ NextAction = $ID.fallback; ErrorType = "InputTimeLimitExceeded" },
                    [ordered]@{ NextAction = $ID.fallback; ErrorType = "NoMatchingCondition" },
                    [ordered]@{ NextAction = $ID.fallback; ErrorType = "NoMatchingError" }
                )
            }
        },
        # MessageParticipant — Text only, no TextToSpeechType
        [ordered]@{
            Identifier  = $ID.ext1
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Text = ("Records and Administration. " +
                        "Patient records from Somnatek Sleep Health Center have been transferred to Dorsal Health Holdings LLC. " +
                        "To submit a records request, please write to Dorsal Health Holdings, P.O. Box 1140, Harrow County. " +
                        "Standard processing time is fifteen to twenty business days. " +
                        "This line is not monitored. Please do not leave a message.")
            }
            Transitions = [ordered]@{ NextAction = $ID.disconnect }
        },
        [ordered]@{
            Identifier  = $ID.ext2
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Text = ("You have reached the research department. " +
                        "The Wexler University longitudinal sleep recall study concluded in September 2013. " +
                        "Study enrollment is closed and no new participants are being accepted. " +
                        "For research records inquiries, please contact Dorsal Health Holdings LLC.")
            }
            Transitions = [ordered]@{ NextAction = $ID.disconnect }
        },
        [ordered]@{
            Identifier  = $ID.ext3
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Text = ("You have reached the office of Dr. Mara Ellison. " +
                        "Dr. Ellison is currently on administrative leave. " +
                        "This voicemail is no longer accepting messages. " +
                        "For clinical inquiries, please contact your primary care provider. " +
                        "For records inquiries, please contact Dorsal Health Holdings LLC.")
            }
            Transitions = [ordered]@{ NextAction = $ID.disconnect }
        },
        [ordered]@{
            Identifier  = $ID.ext4
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Text = ("The extension you have dialed is no longer in service. " +
                        "Somnatek Sleep Health Center ceased operations on September 18, 2014. " +
                        "For records inquiries, please contact Dorsal Health Holdings LLC.")
            }
            Transitions = [ordered]@{ NextAction = $ID.disconnect }
        },
        [ordered]@{
            Identifier  = $ID.fallback
            Type        = "MessageParticipant"
            Parameters  = [ordered]@{
                Text = ("You have reached Somnatek Sleep Health Center. " +
                        "Our offices are no longer in operation. " +
                        "For records inquiries, please contact Dorsal Health Holdings LLC " +
                        "at the address listed on our website. Thank you.")
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
Write-Host "Flow JSON built ($($flowJson.Length) chars)"

# ── Try to create the contact flow ────────────────────────────────────────────
Write-Host "`nCreating contact flow 'SomnatekMainLine'..."
$result = aws connect create-contact-flow `
    --instance-id $InstanceId `
    --name "SomnatekMainLine" `
    --type "CONTACT_FLOW" `
    --description "Somnatek ARG - main clinic line inbound handler" `
    --content $flowJson `
    --cli-error-format json `
    --profile $Profile 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR from Connect API:"
    Write-Host $result
    throw "create-contact-flow failed (see error above)"
}

$flowData    = $result | ConvertFrom-Json
$flowId      = $flowData.ContactFlowId
$flowArn     = $flowData.ContactFlowArn
Write-Host "Contact flow created: $flowId"

# ── Claim a phone number ───────────────────────────────────────────────────────
Write-Host "`nClaiming a US DID phone number..."
$numResult = aws connect search-available-phone-numbers `
    --target-arn "arn:aws:connect:us-east-1:816418998457:instance/$InstanceId" `
    --phone-number-country-code US `
    --phone-number-type DID `
    --max-results 1 `
    --profile $Profile 2>&1

if ($LASTEXITCODE -ne 0) { throw "search-available-phone-numbers failed: $numResult" }

$numData      = $numResult | ConvertFrom-Json
$phoneNumber  = $numData.AvailableNumbersList[0].PhoneNumber
Write-Host "Available number: $phoneNumber"

$claimResult = aws connect claim-phone-number `
    --target-arn "arn:aws:connect:us-east-1:816418998457:instance/$InstanceId" `
    --phone-number $phoneNumber `
    --profile $Profile 2>&1

if ($LASTEXITCODE -ne 0) { throw "claim-phone-number failed: $claimResult" }

$claimData    = $claimResult | ConvertFrom-Json
$phoneNumberId = $claimData.PhoneNumberId
Write-Host "Claimed: $phoneNumber (ID: $phoneNumberId)"

# ── Associate number with contact flow ────────────────────────────────────────
Write-Host "`nAssociating $phoneNumber with SomnatekMainLine..."
$assocResult = aws connect associate-phone-number-contact-flow `
    --instance-id $InstanceId `
    --phone-number-id $phoneNumberId `
    --contact-flow-id $flowId `
    --profile $Profile 2>&1

if ($LASTEXITCODE -ne 0) { throw "associate-phone-number-contact-flow failed: $assocResult" }

Write-Host @"

Done.
  Phone number : $phoneNumber
  Contact flow : $flowId

Next steps:
  1. Update CONNECT_PHONE_NUMBER in .env: $phoneNumber
  2. Update the phone number in sites/somnatek/index.html
  3. git commit and redeploy the site
"@
