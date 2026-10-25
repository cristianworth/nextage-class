param([string]$PostgresBin = '', [int]$Port = 55432)
$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$local = Join-Path $repository 'work/postgres'
$data = Join-Path $local 'data'
$configuration = Join-Path $local 'server-env.json'
if (-not $PostgresBin) {
    $PostgresBin = if (Test-Path -LiteralPath $configuration) { (Get-Content -Raw -LiteralPath $configuration | ConvertFrom-Json).PostgresBin } else { Join-Path $repository 'work/toolchain/postgresql/pgsql/bin' }
}
$pgCtl = Join-Path $PostgresBin 'pg_ctl.exe'
if (-not (Test-Path -LiteralPath $pgCtl)) { throw 'Informe -PostgresBin com os executáveis PostgreSQL. Veja docs/server-development.md.' }
New-Item -ItemType Directory -Path $local -Force | Out-Null
if (-not (Test-Path -LiteralPath $configuration)) {
    if (Test-Path -LiteralPath (Join-Path $data 'PG_VERSION')) { throw 'Existe um banco local sem sua configuração. Recupere server-env.json; o banco não será reiniciado.' }
    $password = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $passwordFile = Join-Path $local 'init-password.txt'
    [IO.File]::WriteAllText($passwordFile, $password)
    try {
        & (Join-Path $PostgresBin 'initdb.exe') -D $data --username=nextage --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível inicializar o PostgreSQL local.' }
    } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
    @{ Port = $Port; PostgresBin = $PostgresBin; ConnectionString = "Host=127.0.0.1;Port=$Port;Database=nextage_class;Username=nextage;Password=$password;Timeout=5" } |
        ConvertTo-Json | Set-Content -LiteralPath $configuration -Encoding utf8
}
$settings = Get-Content -Raw -LiteralPath $configuration | ConvertFrom-Json
$Port = $settings.Port
& $pgCtl -D $data status | Out-Null
if ($LASTEXITCODE -ne 0) {
    & $pgCtl -D $data -l (Join-Path $local 'server.log') -o "-h 127.0.0.1 -p $Port" -w start
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível iniciar o banco isolado. Confira a porta e work/postgres/server.log.' }
}
$previousPassword = $env:PGPASSWORD
try {
    $env:PGPASSWORD = ([regex]::Match($settings.ConnectionString, 'Password=([^;]+)')).Groups[1].Value
    $exists = & (Join-Path $PostgresBin 'psql.exe') -w -h 127.0.0.1 -p $Port -U nextage -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='nextage_class'"
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível consultar o banco local.' }
    if ($exists -ne '1') {
        & (Join-Path $PostgresBin 'createdb.exe') -w -h 127.0.0.1 -p $Port -U nextage nextage_class
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível criar o banco fictício de desenvolvimento.' }
    }
} finally { $env:PGPASSWORD = $previousPassword }
Write-Output "PostgreSQL local disponível em 127.0.0.1:$Port. Configuração privada em work/postgres/server-env.json."
