$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
if (-not $env:NEXTAGE_TEST_CONNECTION) {
    $settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
    $testConnection = [System.Data.Common.DbConnectionStringBuilder]::new()
    # Direct setters invalidate the cached connection string; PowerShell's dictionary adapter does not.
    $testConnection.set_ConnectionString($settings.ConnectionString)
    $testConnection.set_Item('Database', 'nextage_class_tests')
    $env:NEXTAGE_TEST_CONNECTION = $testConnection.get_ConnectionString()
}
& (Join-Path $PSScriptRoot 'dotnet.ps1') test api/NextageClass.slnx --logger 'trx;LogFileName=api-tests.trx' --results-directory work/test-results
exit $LASTEXITCODE
