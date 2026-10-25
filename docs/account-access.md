# Acesso autenticado — estado do 3B

## B1 implementado; restante em andamento

A API valida assinatura assimétrica, emissor do projeto configurado, audiência authenticated e expiração. A sessão depende também de um perfil ativo no schema app. O perfil fornece papel e vínculo com aluno; claims role/user_metadata editáveis não concedem acesso. Contas sem perfil ativo recebem 403 e tokens ausentes/inválidos recebem 401.

GET /api/session retorna apenas userId, displayName, role e studentId do vínculo autorizado. Ainda não há login/ativação na interface nem convite administrativo entregue; B2–B4 continuam na mudança deliver-supabase-access-3b. Não confundir este contrato com conclusão do piloto.

## Schema e migrações

database/migrations/001_account_access.sql cria cadastro mínimo e perfis de acesso, com integridade entre aluno e perfil, papel limitado a teacher/student e um único perfil da professora. RLS é habilitado sem políticas públicas; schema app e tabelas não recebem acesso de PUBLIC. Operações de aplicação passam pela API e por suas permissões. A conexão administrativa do banco é configuração do servidor, nunca do navegador.

Migrações são explícitas: ./scripts/migrate-api.ps1 no banco local. O executor incorpora os arquivos SQL, serializa a aplicação com lock de migração, registra checksum e executa cada nova migração em transação. A leitura não modifica o schema. Uma migração já aplicada não pode ser reescrita silenciosamente; acrescentar outra para evoluir o modelo.

O projeto Supabase foi inspecionado vazio antes da primeira migração. Cadastro e perfis foram criados no schema app; as permissões de schema para anon/authenticated foram verificadas como falsas. A migração 002 também habilita RLS na tabela técnica de histórico, sem alterar o checksum da 001. Ausência de políticas públicas é intencional: o cliente não lê essas tabelas diretamente. Ver [RLS e políticas](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Configuração

Além de ConnectionStrings__NextageClass, configurar Supabase__Url com a URL HTTPS do projeto. scripts/run-api.ps1 também pode ler a URL de work/supabase/project.json. Esse arquivo é local e ignorado. Chave administrativa não é necessária para validar JWT; será usada somente no servidor ao integrar convites.

JWKS vem do endpoint público documentado do mesmo emissor, com atualização a cada dez minutos, sem aceitar HS256 ou um emissor escolhido pelo token. A política de rotação/expiração do provedor deve ser respeitada. Não implementar algoritmos próprios nem exportar chaves privadas para testes.

## Evidências locais e limites

Onze testes HTTP aprovados até B1: quatro de processo/banco e sete de autenticação/vínculo. Os testes de acesso usam JWTs realmente assinados com chaves fictícias e PostgreSQL real; cobrem assinatura, emissor, audiência, expiração, vínculo ausente/inativo, identificador inválido e metadados falsos. Migração repetida não recria tabelas. São testes de integração local, sem afirmar que login e envio real no Supabase já foram validados.

Não há perfil concedido ao primeiro login nem promoção automática por e-mail. A professora deve ser vinculada por procedimento administrativo verificado; os alunos, pelo convite autorizado. Em 25/10/2026, Cristian desativou o cadastro público; a consulta da configuração real confirmou disable_signup=true, provedor de e-mail habilitado e confirmação de e-mail mantida. Convites reais, SMTP e recuperação completa ainda precisam da conferência B4.
