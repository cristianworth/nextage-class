# Desenvolvimento do servidor

Base 3A: ASP.NET Core/.NET 10 LTS, Npgsql 10 e PostgreSQL 18. A demo React continua independente. O 3B acrescenta validação de identidade Supabase e sessão autorizada; login/convites continuam em implementação. Ver [account-access.md](account-access.md).

## Ferramentas

O SDK está fixado em global.json (10.0.402, aceitando patches da mesma faixa). Pode ser instalado normalmente. scripts/dotnet.ps1 também encontra o SDK local em work/toolchain/dotnet, mantendo cache e pacotes fora do Git. No ambiente desta entrega, SDK e PostgreSQL foram extraídos em work/toolchain sem instalar serviço global.

- [SDK e instalador oficial .NET](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script).
- [Política de suporte .NET](https://dotnet.microsoft.com/en-us/platform/support/policy): .NET 10 é LTS.
- [PostgreSQL para Windows](https://www.postgresql.org/download/windows/) e [binários EDB](https://www.enterprisedb.com/download-postgresql-binaries).

Para PostgreSQL instalado em outro local, informar -PostgresBin no primeiro comando. O script inicializa uma instância **nova e fictícia** em work/postgres, ligada somente a 127.0.0.1:55432, com senha aleatória. Não altera instalações existentes nem reinicia dados silenciosamente. Credenciais, dados e logs ficam em work, ignorado pelo Git. A configuração privada não deve ser colada em logs ou commits.

## Executar no Windows

Na raiz, com SDK e binários disponíveis:

```powershell
./scripts/start-local-database.ps1
./scripts/dotnet.ps1 restore api/NextageClass.slnx --locked-mode
./scripts/migrate-api.ps1
./scripts/run-api.ps1
```

A API inicia em http://127.0.0.1:5080. O comando fica ativo até ser encerrado. Em outro terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:5080/api/health/live
Invoke-RestMethod http://127.0.0.1:5080/api/health/ready
./scripts/test-api.ps1
./scripts/stop-local-database.ps1
```

Processo ativo retorna 200; prontidão consulta PostgreSQL real e retorna 200 ou 503, com somente status público e sem cache. Desligar o banco não derruba o processo; a prontidão deve indicar indisponibilidade. Iniciar sem ConnectionStrings__NextageClass produz erro claro, sem conexão fictícia silenciosa. run-api carrega a configuração local privada somente quando a variável não está definida.

## Outro ambiente e limites

Sem os scripts Windows, usar o SDK fixado, um PostgreSQL próprio de desenvolvimento e as variáveis ConnectionStrings__NextageClass/Supabase__Url para a API e NEXTAGE_TEST_CONNECTION para testes. Supabase__Url é a URL HTTPS do projeto; o script de execução também encontra essa URL em work/supabase/project.json. Executar dotnet restore/build/test na solução api/NextageClass.slnx. Testes de integração exigem banco real e falham se a configuração não existe; não são ignorados silenciosamente.

Pacotes usam versões fixas e packages.lock.json. Contas, esquema de negócio, convites e recuperação entram nos próximos recortes. Não há endpoint de cadastro público ou importação automática de localStorage. Credenciais e instância local não servem como configuração de produção.
