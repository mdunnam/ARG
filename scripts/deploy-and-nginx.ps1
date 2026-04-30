$env:AWS_PROFILE = "somnatek-arg"

Write-Host "=== Syncing site to S3 ==="
aws s3 sync G:\APPS\ARG\sites\somnatek\ s3://somnatek-site/ --delete

$c2 = aws ssm send-command `
  --instance-ids "i-081a7e7e3c65b1f5d" `
  --document-name "AWS-RunShellScript" `
  --parameters '{"commands":["aws s3 sync s3://somnatek-site/ /var/www/somnatek/ --delete","chown -R nginx:nginx /var/www/somnatek","echo SYNC_OK"]}' `
  --query "Command.CommandId" --output text
Write-Host "SyncCmd: $c2"

Write-Host "=== Uploading nginx script (after sync) ==="
aws s3 cp G:\APPS\ARG\scripts\update-nginx-admin.sh s3://somnatek-site/tmp/update-nginx-admin.sh

$c1 = aws ssm send-command `
  --instance-ids "i-081a7e7e3c65b1f5d" `
  --document-name "AWS-RunShellScript" `
  --parameters '{"commands":["aws s3 cp s3://somnatek-site/tmp/update-nginx-admin.sh /tmp/update-nginx-admin.sh","bash /tmp/update-nginx-admin.sh","aws s3 rm s3://somnatek-site/tmp/update-nginx-admin.sh","rm /tmp/update-nginx-admin.sh"]}' `
  --query "Command.CommandId" --output text
Write-Host "NginxCmd: $c1"

Write-Host "=== Waiting 18s ==="
Start-Sleep -Seconds 18

Write-Host "=== Sync result ==="
aws ssm get-command-invocation --command-id $c2 --instance-id "i-081a7e7e3c65b1f5d" --query "[Status,StandardOutputContent]" --output json

Write-Host "=== Nginx result ==="
aws ssm get-command-invocation --command-id $c1 --instance-id "i-081a7e7e3c65b1f5d" --query "[Status,StandardOutputContent,StandardErrorContent]" --output json
