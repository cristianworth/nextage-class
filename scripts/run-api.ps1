$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
if (-not $env:ConnectionStrings__NextageClass) {
    $settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
    $env:ConnectionStrings__NextageClass = $settings.ConnectionString
}
$env:ASPNETCORE_ENVIRONMENT = 'Development'
if (-not $env:Supabase__Url -and (Test-Path -LiteralPath (Join-Path $repository 'work/supabase/project.json'))) {
    $env:Supabase__Url = (Get-Content -Raw -LiteralPath (Join-Path $repository 'work/supabase/project.json') | ConvertFrom-Json).Url
}
& (Join-Path $PSScriptRoot 'dotnet.ps1') run --project api/NextageClass.Api --no-launch-profile --urls http://127.0.0.1:5080
exit $LASTEXITCODE
