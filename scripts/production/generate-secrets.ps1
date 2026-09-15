param(
  [Parameter(Mandatory = $true)]
  [string]$AdminEmail,

  [Parameter(Mandatory = $true)]
  [string]$AdminPhone,

  [string]$AdminName = "VitaLine Admin",

  [string]$OutputFile = ".env.production.local",

  [switch]$Force
)

$ErrorActionPreference = "Stop"

function New-RandomSecret([int]$ByteCount) {
  $bytes = New-Object byte[] $ByteCount
  $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()

  try {
    $generator.GetBytes($bytes)
  }
  finally {
    $generator.Dispose()
  }

  return [Convert]::ToBase64String($bytes)
    .TrimEnd("=")
    .Replace("+", "-")
    .Replace("/", "_")
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$outputPath = Join-Path $projectRoot $OutputFile

if ((Test-Path -LiteralPath $outputPath) -and -not $Force) {
  throw "Output file already exists. Use -Force only if you intend to replace it."
}

$lines = @(
  "ACCESS_TOKEN_SECRET=$(New-RandomSecret 48)",
  "REFRESH_TOKEN_SECRET=$(New-RandomSecret 48)",
  "INTERNAL_API_KEY=$(New-RandomSecret 48)",
  "ADMIN_NAME=$AdminName",
  "ADMIN_EMAIL=$AdminEmail",
  "ADMIN_PASSWORD=$(New-RandomSecret 24)",
  "ADMIN_PHONE=$AdminPhone",
  "ADMIN_IMAGE="
)

$lines | Set-Content -LiteralPath $outputPath -Encoding utf8

Write-Host "Production secrets created: $outputPath"
Write-Host "The file is ignored by Git. Do not share or commit it."
