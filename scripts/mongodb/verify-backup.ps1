param(
  [string]$FileName
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$backupDirectory = Join-Path $projectRoot "backups"

if (-not $FileName) {
  $latestBackup = Get-ChildItem $backupDirectory -Filter "*.archive.gz" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latestBackup) {
    throw "No backup file was found in the backups directory."
  }

  $FileName = $latestBackup.Name
}

if ([System.IO.Path]::GetFileName($FileName) -ne $FileName) {
  throw "Use only a backup file name, not a path."
}

$backupPath = Join-Path $backupDirectory $FileName
if (-not (Test-Path -LiteralPath $backupPath -PathType Leaf)) {
  throw "Backup file does not exist: $backupPath"
}

Push-Location $projectRoot
try {
  docker compose --profile tools run --rm mongo-tools `
    mongorestore `
    --host=mongodb `
    --port=27017 `
    --archive=/backups/$FileName `
    --gzip `
    '--nsInclude=vitaline_*.*' `
    '--nsFrom=vitaline_*.*' `
    '--nsTo=vitaline_restore_test_*.*' `
    --drop `
    --stopOnError

  if ($LASTEXITCODE -ne 0) {
    throw "Temporary restore failed."
  }

  docker compose --profile tools run --rm mongo-tools `
    mongosh `
    mongodb://mongodb:27017/admin `
    --quiet `
    /scripts/verifyRestore.mongosh.js

  if ($LASTEXITCODE -ne 0) {
    throw "Restored data verification failed."
  }
}
finally {
  Pop-Location
}

Write-Host "Backup restore verification completed successfully: $FileName"
