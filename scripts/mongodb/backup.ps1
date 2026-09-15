$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$backupDirectory = Join-Path $projectRoot "backups"
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss'Z'")
$fileName = "vitaline-$timestamp.archive.gz"
$containerPath = "/backups/$fileName"

New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null

Push-Location $projectRoot
try {
  docker compose --profile tools run --rm mongo-tools `
    mongodump `
    --host=mongodb `
    --port=27017 `
    --archive=$containerPath `
    --gzip

  if ($LASTEXITCODE -ne 0) {
    throw "MongoDB backup command failed."
  }
}
finally {
  Pop-Location
}

$backupFile = Get-Item (Join-Path $backupDirectory $fileName)

Write-Host "Backup created successfully."
Write-Host "File: $($backupFile.FullName)"
Write-Host "Size: $($backupFile.Length) bytes"
