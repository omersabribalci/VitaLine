param(
  [Parameter(Mandatory = $true)]
  [string]$FileName,

  [switch]$ConfirmRestore
)

$ErrorActionPreference = "Stop"

if (-not $ConfirmRestore) {
  throw "Restore replaces current collections. Run again with -ConfirmRestore."
}

if ([System.IO.Path]::GetFileName($FileName) -ne $FileName) {
  throw "Use only a backup file name, not a path."
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$backupPath = Join-Path (Join-Path $projectRoot "backups") $FileName

if (-not (Test-Path -LiteralPath $backupPath -PathType Leaf)) {
  throw "Backup file does not exist: $backupPath"
}

$applicationServices = @(
  "frontend",
  "api-gateway",
  "auth-service",
  "patient-service",
  "doctor-service",
  "appointment-service"
)

Push-Location $projectRoot
try {
  docker compose stop $applicationServices
  if ($LASTEXITCODE -ne 0) {
    throw "Application services could not be stopped safely."
  }

  docker compose --profile tools run --rm mongo-tools `
    mongorestore `
    --host=mongodb `
    --port=27017 `
    --archive=/backups/$FileName `
    --gzip `
    '--nsInclude=vitaline_*.*' `
    --drop `
    --stopOnError

  if ($LASTEXITCODE -ne 0) {
    throw "MongoDB restore failed."
  }
}
finally {
  docker compose up -d $applicationServices
  Pop-Location
}

Write-Host "MongoDB restore completed successfully: $FileName"
