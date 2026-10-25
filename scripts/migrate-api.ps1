$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
if (-not $env:ConnectionStrings__NextageClass) {
    $settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
    $env:ConnectionStrings__NextageClass = $settings.ConnectionString
}
& (Join-Path $PSScriptRoot 'dotnet.ps1') run --project api/NextageClass.Api --no-launch-profile -- --migrate
exit $LASTEXITCODE
