$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$settings = Get-Content -Raw -LiteralPath (Join-Path $repository 'work/postgres/server-env.json') | ConvertFrom-Json
$conn = [System.Data.Common.DbConnectionStringBuilder]::new()
$conn.set_ConnectionString($settings.ConnectionString)
if ([string]$conn.get_Item('Host') -ne '127.0.0.1') { throw 'O teste aceita somente PostgreSQL local.' }
$pgbin = $settings.PostgresBin
$pgHost = [string]$conn.get_Item('Host'); $pgPort = [string]$conn.get_Item('Port'); $pgUser = [string]$conn.get_Item('Username')
$suffix = [guid]::NewGuid().ToString('N').Substring(0,12)
$source = "nextage_class_recovery_${suffix}_source_tests"
$target = "nextage_class_recovery_${suffix}_target_tests"
$archive = "fixture_${suffix}.dump"
$invalid = "invalid_${suffix}.dump"
$previousPassword = $env:PGPASSWORD
$previousConnection = $env:ConnectionStrings__NextageClass
$env:PGPASSWORD = [string]$conn.get_Item('Password')
try {
    & (Join-Path $pgbin 'createdb.exe') -h $pgHost -p $pgPort -U $pgUser $source
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível criar o banco fictício.' }
    $conn.set_Item('Database', $source)
    $env:ConnectionStrings__NextageClass = $conn.get_ConnectionString()
    $buildPath = (Join-Path $repository 'work/recovery/build').Replace('\\','/') + '/'
    & (Join-Path $repository 'scripts/dotnet.ps1') build (Join-Path $repository 'api/NextageClass.Api/NextageClass.Api.csproj') '/p:UseAppHost=false' "/p:OutputPath=$buildPath"
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível compilar a API para o ensaio.' }
    & (Join-Path $repository 'scripts/dotnet.ps1') (Join-Path $buildPath 'NextageClass.Api.dll') --migrate
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível migrar o banco fictício.' }
    $seed = @"
INSERT INTO app.books(id,title,levels) VALUES ('book','Sequence',ARRAY['A1']);
INSERT INTO app.materials(id,title,content,book_id,lesson_number) VALUES ('unit','Unit','Current text','book',1);
INSERT INTO app.students(id,name,level,start_date,primary_book_id) VALUES ('student','Fictitious student','A1','2026-01-01','book');
INSERT INTO app.access_profiles(user_id,role,student_id,display_name) VALUES ('10000000-0000-4000-8000-000000000001','student','student','Fictitious student');
INSERT INTO app.schedule_series(id,student_id,created_at) VALUES ('series','student',now());
INSERT INTO app.schedule_segments(series_id,from_index,lesson_date,hour) VALUES ('series',0,'2026-01-05',10);
INSERT INTO app.schedule_lessons(id,student_id,lesson_date,hour,created_at,series_id,occurrence_index,rescheduled_at) VALUES ('weekly/series/0','student','2026-01-06',11,now(),'series',0,now());
INSERT INTO app.lesson_plans(lesson_id,material_id,notes,updated_at) VALUES ('weekly/series/0','unit','Preparation',now());
INSERT INTO app.lesson_records(lesson_id,id,student_name,level,attendance,content,reason,material_snapshot,created_at,updated_at,homework_description,course_progress) VALUES ('weekly/series/0','record','Fictitious student','A1','attended','Private note','', '{"id":"unit","title":"Historical title","content":"Historical text","bookId":"book","lessonNumber":1}'::jsonb,now(),now(),'Homework','{"completed":false}'::jsonb);
INSERT INTO app.scheduling_requests(id,student_id,kind,lesson_date,hour,status) VALUES ('request','student','once','2038-01-04',16,'pending');
"@
    & (Join-Path $pgbin 'psql.exe') -h $pgHost -p $pgPort -U $pgUser -d $source -v ON_ERROR_STOP=1 -c $seed 1>$null
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível inserir a fixture fictícia.' }
    $tables = @('students','access_profiles','student_invitations','books','materials','schedule_series','schedule_segments','schedule_lessons','schedule_blocks','lesson_records','lesson_plans','scheduling_requests','schema_migrations')
    function Snapshot([string]$database) {
        foreach ($table in $tables) {
            $sql = "SELECT '${table}:' || count(*) || ':' || md5(COALESCE(string_agg(row_to_json(t)::text, E'\\n' ORDER BY row_to_json(t)::text),'')) FROM app.$table t"
            & (Join-Path $pgbin 'psql.exe') -h $pgHost -p $pgPort -U $pgUser -d $database -At -c $sql
            if ($LASTEXITCODE -ne 0) { throw "Não foi possível comparar $table." }
        }
    }
    $before = @(Snapshot $source)
    & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Backup -SourceDatabase $source -ArchiveName $archive
    & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Restore -SourceDatabase $source -ArchiveName $archive -TargetDatabase $target
    if (Compare-Object $before @(Snapshot $target)) { throw 'Os dados restaurados diferem da origem.' }
    if (Compare-Object $before @(Snapshot $source)) { throw 'A origem foi alterada durante o ensaio.' }
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Restore -SourceDatabase $source -ArchiveName $archive } catch { $blocked = $true }
    if (-not $blocked) { throw 'Destino ausente não foi recusado.' }
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Backup -SourceDatabase 'nextage_class' -ArchiveName $archive } catch { $blocked = $true }
    if (-not $blocked) { throw 'Origem de desenvolvimento não foi recusada.' }
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Backup -SourceDatabase $source -ArchiveName $archive } catch { $blocked = $true }
    if (-not $blocked) { throw 'Cópia existente não foi preservada.' }
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Restore -SourceDatabase $source -ArchiveName $archive -TargetDatabase $source } catch { $blocked = $true }
    if (-not $blocked) { throw 'Origem igual ao destino não foi recusada.' }
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Restore -SourceDatabase $source -ArchiveName $archive -TargetDatabase $target } catch { $blocked = $true }
    if (-not $blocked) { throw 'Destino existente não foi recusado.' }
    $invalidPath = Join-Path $repository "work/recovery/$invalid"
    [IO.File]::WriteAllText($invalidPath, 'not a database archive')
    $blocked = $false
    try { & (Join-Path $repository 'scripts/recover-test-database.ps1') -Action Restore -SourceDatabase $source -ArchiveName $invalid -TargetDatabase "nextage_class_recovery_${suffix}_invalid_tests" } catch { $blocked = $true }
    if (-not $blocked) { throw 'Cópia inválida não foi recusada.' }
    if (Compare-Object $before @(Snapshot $source)) { throw 'A origem foi alterada após as tentativas recusadas.' }
    Write-Output 'Ensaio passou: 13 tabelas comparadas, origem preservada, destinos inseguros e cópia inválida recusados.'
    Write-Output "Bancos e arquivos fictícios do ensaio permanecem em work/PostgreSQL local: $source, $target, $archive, $invalid."
} finally {
    if ($null -eq $previousPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue } else { $env:PGPASSWORD = $previousPassword }
    if ($null -eq $previousConnection) { Remove-Item Env:ConnectionStrings__NextageClass -ErrorAction SilentlyContinue } else { $env:ConnectionStrings__NextageClass = $previousConnection }
}