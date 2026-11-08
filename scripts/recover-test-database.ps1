param(
    [Parameter(Mandatory)][ValidateSet('Backup','Restore')][string]$Action,
    [Parameter(Mandatory)][string]$SourceDatabase,
    [Parameter(Mandatory)][string]$ArchiveName,
    [string]$TargetDatabase
)
$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
if ($SourceDatabase -notmatch '^nextage_class_[a-z0-9_]*tests$') { throw 'A origem deve ser um banco de teste local identificado por nextage_class_*tests.' }
if ($ArchiveName -notmatch '^[a-zA-Z0-9_-]+\.dump$') { throw 'Informe um nome simples de arquivo .dump.' }
if ($Action -eq 'Restore') {
    if ($TargetDatabase -notmatch '^nextage_class_recovery_[a-z0-9_]*tests$') { throw 'O destino deve ser um novo banco local nextage_class_recovery_*tests.' }
    if ($TargetDatabase -eq $SourceDatabase) { throw 'Origem e destino devem ser diferentes.' }
}
$settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
$connection = [System.Data.Common.DbConnectionStringBuilder]::new()
$connection.set_ConnectionString($settings.ConnectionString)
if ([string]$connection.get_Item('Host') -ne '127.0.0.1') { throw 'O ensaio aceita somente a instância local em 127.0.0.1.' }
$pgbin = $settings.PostgresBin
$archiveDir = Join-Path $repository 'work/recovery'
New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
$archive = Join-Path $archiveDir $ArchiveName
$pgHost = [string]$connection.get_Item('Host')
$pgPort = [string]$connection.get_Item('Port')
$pgUser = [string]$connection.get_Item('Username')
$previousPassword = $env:PGPASSWORD
$env:PGPASSWORD = [string]$connection.get_Item('Password')
try {
    if ($Action -eq 'Backup') {
        if (Test-Path -LiteralPath $archive) { throw 'O arquivo já existe; escolha outro nome.' }
        & (Join-Path $pgbin 'pg_dump.exe') -h $pgHost -p $pgPort -U $pgUser -d $SourceDatabase -Fc -f $archive
        if ($LASTEXITCODE -ne 0) { throw 'A cópia falhou; não a considere válida.' }
        Write-Output "Cópia criada em work/recovery/$ArchiveName."
    } else {
        if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) { throw 'A cópia não foi encontrada.' }
        & (Join-Path $pgbin 'pg_restore.exe') --list $archive 1>$null 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'A cópia não é um arquivo PostgreSQL válido.' }
        $existing = & (Join-Path $pgbin 'psql.exe') -h $pgHost -p $pgPort -U $pgUser -d postgres -At -c "SELECT 1 FROM pg_database WHERE datname='$TargetDatabase'"
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar o destino.' }
        if ($existing) { throw 'O banco de destino já existe; não será alterado.' }
        & (Join-Path $pgbin 'createdb.exe') -h $pgHost -p $pgPort -U $pgUser $TargetDatabase
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível criar o banco isolado.' }
        & (Join-Path $pgbin 'pg_restore.exe') -h $pgHost -p $pgPort -U $pgUser -d $TargetDatabase --exit-on-error $archive
        if ($LASTEXITCODE -ne 0) { throw 'Restauração falhou; o destino isolado pode estar incompleto e não deve ser usado.' }
        Write-Output "Restauração concluída no banco isolado $TargetDatabase; confira os dados antes de considerar a cópia recuperável."
    }
} finally {
    if ($null -eq $previousPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue } else { $env:PGPASSWORD = $previousPassword }
}