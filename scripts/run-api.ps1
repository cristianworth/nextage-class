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
$privateConfiguration = Join-Path $repository 'work/supabase/server-secrets.json'
if (Test-Path -LiteralPath $privateConfiguration) {
    try { $supabaseSettings = Get-Content -Raw -LiteralPath $privateConfiguration | ConvertFrom-Json }
    catch { throw 'Não foi possível ler a configuração privada do Supabase. Confira o formato JSON sem compartilhar seu conteúdo.' }
    if (-not $env:Supabase__SecretKey) { $env:Supabase__SecretKey = $supabaseSettings.SecretKey }
    if (-not $env:Supabase__InvitationRedirectUrl) { $env:Supabase__InvitationRedirectUrl = $supabaseSettings.InvitationRedirectUrl }
}
& (Join-Path $PSScriptRoot 'dotnet.ps1') run --project api/NextageClass.Api --no-launch-profile --urls http://127.0.0.1:5080
exit $LASTEXITCODE
