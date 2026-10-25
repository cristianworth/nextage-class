# Supabase no piloto

Escolha confirmada por Cristian em 25/10/2026: Supabase para PostgreSQL hospedado e autenticação, mantendo ASP.NET Core como API de regras e permissões. O projeto separado Nextage Class foi criado na organização escolhida e região São Paulo, após cotação de $0/mês. Identificadores de ambiente e credenciais ficam fora do histórico. O projeto GachaManagement não é alterado.

## Responsabilidades

| Parte | Responsabilidade |
| --- | --- |
| Supabase Auth | Senhas, comprovação de identidade, sessões, convites e recuperação |
| Interface React | Entrada/ativação/recuperação, apresentação e envio das ações permitidas |
| API C# | Validar identidade, vínculo com aluno, papel e regras de negócio; filtrar dados retornados |
| PostgreSQL | Persistência, restrições e consistência das alterações |

Não criar senhas ou um segundo cadastro de credenciais no backend. O papel do usuário e seu vínculo não serão aceitos de parâmetros enviados pelo cliente nem de metadados que ele possa editar. Token válido não concede automaticamente papel de professora ou acesso a outro aluno.

## Segurança e configuração

A API valida assinatura, emissor, destinatário e validade dos tokens do projeto configurado. Preferir chaves assimétricas e descoberta das chaves públicas. Contas sem vínculo ativo não recebem acesso ao conteúdo. Convites administrativos são restritos à professora; cadastro público deve estar desabilitado no serviço, além da ausência de botão na interface.

Chave publicável identifica a aplicação e pode ser usada no cliente; chave administrativa/secret e conexão do banco ficam somente no servidor. O acesso direto às tabelas pela Data API não será presumido: usar esquema restrito e políticas/grants explícitos, verificando RLS quando houver exposição. Tokens, senhas e conteúdo de e-mails não entram em logs ou Git.

As configurações reais do projeto precisam ser conferidas antes de declarar a integração pronta. Testes locais de assinatura/permissões complementam a verificação no provedor; não a substituem. Nenhum convite real é enviado sem destinatário e contexto autorizados.

## Plano gratuito e operação

Na consulta oficial de 25/10/2026, o plano Free inclui 500 MB de banco, até dois projetos ativos e pausa por baixa atividade por uma semana. Backups automáticos não estão incluídos no Free. Para este acervo inicial em texto, o plano é a opção de partida, sem garantir disponibilidade contínua nem custo zero para todas as partes do produto.

O envio de convites/recuperação a alunos exige configurar SMTP próprio; o serviço padrão de e-mail é limitado para testes. Hospedagem da API C# e da interface é separada do banco. Provedores, retenção e restauração serão definidos/verificados no 3E antes de dados reais. Não contratar serviços pagos por inferência.

## Referências oficiais verificadas

- [Preços e limites](https://supabase.com/pricing) e [pausa no Free](https://supabase.com/docs/guides/platform/free-project-pausing).
- [Usuários e convites](https://supabase.com/docs/guides/auth/users), [segurança de senhas](https://supabase.com/docs/guides/auth/password-security) e [chaves de assinatura](https://supabase.com/docs/guides/auth/signing-keys).
- [Chaves da aplicação](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [conexão PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres).
- [SMTP](https://supabase.com/docs/guides/auth/auth-smtp) e [backups](https://supabase.com/docs/guides/platform/backups).
