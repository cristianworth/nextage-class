# Design

## Context

Ver proposal.md. A demo React e o modelo local v6 permanecem independentes. Não havia SDK .NET, Docker ou PostgreSQL nos caminhos usuais; ferramentas oficiais foram extraídas em work/toolchain, já ignorado. SDK 10.0.402 e PostgreSQL 18.6 foram executados e identificados.

## Goals / Non-Goals

API e testes devem executar com SDK instalado normalmente ou ferramenta local. Este recorte valida infraestrutura real e não cria tabelas genéricas apenas para preencher uma migração. Identidade, esquema relacional e comandos de negócio entram em 3B/3C, quando têm uso concreto.

## Decisions

- .NET 10 LTS com SDK fixado e atualização de patch permitida. Npgsql é o driver PostgreSQL; EF Core/Identity serão acrescentados no recorte de contas. Evitar uma interface de banco própria ou ORM sem modelo concreto.
- Processo e prontidão usam health checks nativos do ASP.NET Core. Prontidão executa SELECT 1 com timeout e retorna somente situação pública. Não criar páginas de diagnóstico com detalhes da conexão.
- Testes HTTP usam a fábrica de aplicação do ASP.NET Core e PostgreSQL real, configurado explicitamente. Um teste de conexão recusada protege a resposta pública. Sem substituir PostgreSQL por SQLite ou testes que passam por não executar integração.
- Scripts PowerShell resolvem SDK global/local e banco local em work. Escopo do banco é uma instância fictícia isolada, porta própria e autenticação com senha aleatória. Não instalar serviço, abrir portas externas, imprimir credenciais ou sobrescrever instâncias existentes.
- O repositório mantém scripts e configuração de exemplo sem senha; pacotes, dados, logs, senha local e resultados ficam ignorados. Segredos de implantação serão externos.

## Risks / Trade-offs

- Ferramentas locais ocupam espaço → work é ignorado e a documentação oferece uso de instalações existentes.
- Banco pode cair depois da inicialização → prontidão consulta a cada chamada, com timeout e sem cache.
- Base executável não equivale a piloto funcional → roadmap distingue 3A de contas, fluxos persistidos e operação real.

## Migration Plan

Não migrar localStorage nem dados reais neste recorte. Inicializar somente um banco fictício novo de desenvolvimento. A demo continua disponível quando API ou banco estiverem desligados.
