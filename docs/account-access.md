# Acesso autenticado — estado do 3B

## B1–B3 implementados; integração real B4 pendente

A API valida assinatura assimétrica, emissor do projeto configurado, audiência authenticated e expiração. A sessão depende também de um perfil ativo no schema app. O perfil fornece papel e vínculo com aluno; claims role/user_metadata editáveis não concedem acesso. Contas sem perfil ativo recebem 403 e tokens ausentes/inválidos recebem 401.

GET /api/session retorna apenas userId, displayName, role e studentId do vínculo autorizado. Cadastro mínimo, convite administrativo e telas de entrada/ativação/recuperação estão implementados. A conferência real B4 continua na mudança deliver-supabase-access-3b; isso ainda não conclui o piloto.

## Cadastro e convite da professora

Somente o perfil teacher pode listar/cadastrar alunos e criar/consultar convites. POST /api/students valida nome, nível, data de início e campos complementares. POST /api/students/{id}/invitation recebe o e-mail, preservando o aluno escolhido pela professora. A chave administrativa e a URL de retorno são configuração do servidor, sem entrada pelo formulário do aluno.

O servidor registra a tentativa antes de chamar o SDK Supabase 8.5.0. Após o provedor confirmar o convite, consulta a identidade exata e cria o perfil student e a confirmação do envio em uma transação. O SDK retorna booleano para convite; a consulta administrativa resolve o ID sem inventá-lo ou confiar em metadados editáveis. Pedidos concorrentes para o mesmo aluno/e-mail não enviam dois convites. Um perfil já existente não é sobrescrito.

Falhas após o início do envio ficam como needs_review, sem conceder novo acesso ou reenviar automaticamente. O provedor pode ter enviado o e-mail mesmo sem confirmação local; a professora recebe erro claro e deve conferir a tentativa antes de outra ação. A falta de configuração administrativa é detectada antes de criar a tentativa: retorna indisponível e informa que nenhum convite foi enviado.

A tela da professora permite cadastrar e convidar alunos, consultar o estado do convite e reconhecer os envios que exigem revisão. Não reenvia tentativas incertas automaticamente. A confirmação do provedor indica envio aceito, sem garantir entrega na caixa de entrada. Não há chamada real de convite nos testes locais. Destinatários reais continuam dependendo de autorização e envio de e-mail configurado.

## Telas e sessão

O piloto usa o cliente oficial supabase-js 2.118.0 para entrada, ativação e recuperação de senha. Recuperação informa uma resposta condicional, sem confirmar a existência do endereço. Links inválidos orientam a solicitar recuperação. A nova senha exige doze caracteres na interface; a configuração e as políticas reais do provedor serão conferidas no B4.

O papel exibido vem da API. Ao sair ou mudar de conta, formulários e dados do contexto anterior são descartados; respostas atrasadas são ignoradas. Se sair falhar, o conteúdo protegido fica oculto e há uma ação para tentar novamente. A renovação de token pode repetir uma chamada recusada com 401 uma única vez, sem perder o formulário.

A demo da porta 5173 continua independente. O piloto da porta 5174 oferece acesso e cadastro/convites; a rotina completa da professora será conectada no 3C e a consulta do aluno no 3D. Não há importação automática do localStorage da demo. Ver [roteiro e evidências do 3B](verification-3b.md).

## Schema e migrações

database/migrations/001_account_access.sql cria cadastro mínimo e perfis de acesso, com integridade entre aluno e perfil, papel limitado a teacher/student e um único perfil da professora. RLS é habilitado sem políticas públicas; schema app e tabelas não recebem acesso de PUBLIC. Operações de aplicação passam pela API e por suas permissões. A conexão administrativa do banco é configuração do servidor, nunca do navegador.

Migrações são explícitas: ./scripts/migrate-api.ps1 no banco local. O executor incorpora os arquivos SQL, serializa a aplicação com lock de migração, registra checksum e executa cada nova migração em transação. A leitura não modifica o schema. Uma migração já aplicada não pode ser reescrita silenciosamente; acrescentar outra para evoluir o modelo.

O projeto Supabase foi inspecionado vazio antes da primeira migração. Cadastro e perfis foram criados no schema app; as permissões de schema para anon/authenticated foram verificadas como falsas. A migração 002 também habilita RLS na tabela técnica de histórico, sem alterar o checksum da 001. Ausência de políticas públicas é intencional: o cliente não lê essas tabelas diretamente. Ver [RLS e políticas](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Configuração

Além de ConnectionStrings__NextageClass, configurar Supabase__Url com a URL HTTPS do projeto. scripts/run-api.ps1 também pode ler a URL de work/supabase/project.json. Esse arquivo é local e ignorado. Chave administrativa não é necessária para validar JWT; convites exigem Supabase__SecretKey e Supabase__InvitationRedirectUrl.

Para configurar localmente, copiar config/supabase-server.example.json para work/supabase/server-secrets.json e preencher apenas no arquivo privado. Usar a chave secret do servidor, nunca a publicável nem variáveis VITE_. Não colar a chave na conversa. Cristian configurou a chave, aceita pelo provedor em 25/10/2026. Uma identidade de teste foi verificada e vinculada explicitamente ao papel teacher, no banco local e no projeto separado; o provedor aceitou o envio do convite. O retorno de ativação para a porta 5174 foi conferido na geração do link. Recebimento, definição da senha, entrada e recuperação ainda precisam da conferência B4.

JWKS vem do endpoint público documentado do mesmo emissor, com atualização a cada dez minutos, sem aceitar HS256 ou um emissor escolhido pelo token. A política de rotação/expiração do provedor deve ser respeitada. Não implementar algoritmos próprios nem exportar chaves privadas para testes.

## Evidências locais e limites

Dezenove testes HTTP aprovados até B2: quatro de processo/banco, sete de autenticação/vínculo e oito de cadastro/convite. Os testes usam JWTs realmente assinados, PostgreSQL real e provedor de convite simulado; nenhum e-mail é enviado. Cobrem dados inválidos, permissões, envio concorrente único, perfil conflitante, falta de configuração e falha sem falso sucesso. Migração repetida não recria tabelas. Isso não afirma que login e envio real no Supabase já foram validados.

Não há perfil concedido ao primeiro login nem promoção automática por e-mail. A professora é vinculada por procedimento administrativo verificado; os alunos, pelo convite autorizado. Em 25/10/2026, Cristian desativou o cadastro público; a consulta da configuração real confirmou disable_signup=true, provedor de e-mail habilitado e confirmação de e-mail mantida. O primeiro envio de teste foi aceito pelo Supabase; o fluxo completo e o envio operacional a alunos permanecem pendentes. Não publicar endereços, chaves, tokens ou recibos privados no repositório.
