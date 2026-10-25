param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$localSdk = Join-Path $repository 'work/toolchain/dotnet/dotnet.exe'
$installed = Get-Command dotnet -ErrorAction SilentlyContinue
$executable = if ($installed) { $installed.Source } elseif (Test-Path -LiteralPath $localSdk) { $localSdk } else { throw 'Instale o SDK .NET definido em global.json ou prepare work/toolchain/dotnet.' }
$env:DOTNET_CLI_HOME = Join-Path $repository 'work/dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_NOLOGO = '1'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
$env:NUGET_PACKAGES = Join-Path $repository 'work/nuget'
Push-Location $repository
try { & $executable @Arguments; $result = $LASTEXITCODE } finally { Pop-Location }
exit $result
