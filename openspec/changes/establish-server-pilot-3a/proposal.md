# Proposal

## Why

A etapa 2 está aprovada e a demo ainda depende do navegador. O recorte 3A prepara um servidor executável com PostgreSQL e verificação real de conectividade antes de receber contas e dados do piloto.

## What Changes

- Aplicação ASP.NET Core em `api/`, sem substituir a demo fictícia React.
- Conexão PostgreSQL por configuração externa, sem senha ou dados privados no repositório.
- Verificações separadas de processo ativo e banco disponível, com respostas públicas mínimas.
- Execução/testes reproduzíveis e orientação para ferramentas locais sem instalação global obrigatória.

## Capabilities

### New Capabilities
- `server-foundation`: execução do servidor, configuração e indicação de prontidão sem detalhes privados.

### Modified Capabilities
Nenhuma. Esta entrega não muda regras da demo nem afirma que contas e dados já estão no servidor.

## Impact

Adicionar projetos C#/testes e scripts de desenvolvimento. .NET 10 LTS e PostgreSQL 18; versões exatas verificadas no ambiente. Contas por convite foram aprovadas para o próximo recorte, não serão antecipadas por endpoints públicos de cadastro. Implantação e uso de dados reais continuam no 3E.
