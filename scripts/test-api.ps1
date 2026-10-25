$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
if (-not $env:NEXTAGE_TEST_CONNECTION) {
    $settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
    $env:NEXTAGE_TEST_CONNECTION = $settings.ConnectionString
}
& (Join-Path $PSScriptRoot 'dotnet.ps1') test api/NextageClass.slnx --logger 'trx;LogFileName=api-tests.trx' --results-directory work/test-results
exit $LASTEXITCODE
