$env:AWS_PROFILE = "somnatek-arg"

Write-Host "=== Beacon endpoint ==="
$beaconResult = curl -s -o /dev/null -w "%{http_code}" -X POST https://somnatek.org/api/beacon `
  -H "Content-Type: application/json" `
  -d '{"p":"index","r":"","v":""}'
Write-Host "HTTP: $beaconResult"

Write-Host ""
Write-Host "=== session-integrity comment in index.html ==="
curl -s https://somnatek.org/ | Select-String "session-integrity"

Write-Host ""
Write-Host "=== Admin visitors (named + anon counts) ==="
$resp = curl -s "https://somnatek.org/api/admin?action=visitors" -H "X-Admin-Token: b-ovaMZTPzjKyqqEZ7kR" | ConvertFrom-Json
Write-Host "Named: $($resp.visitors.totalNamed)  Anon: $($resp.visitors.totalAnon)"
Write-Host "Milestone portal_solved count: $($resp.visitors.milestoneCounts.portal_solved)"
