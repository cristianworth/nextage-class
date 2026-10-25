$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$local = Join-Path $repository 'work/postgres'
$settings = Get-Content -Raw -LiteralPath (Join-Path $local 'server-env.json') | ConvertFrom-Json
& (Join-Path $settings.PostgresBin 'pg_ctl.exe') -D (Join-Path $local 'data') -m fast -w stop
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível parar o PostgreSQL local.' }
