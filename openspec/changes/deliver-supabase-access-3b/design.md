# Design

## Context

Ver proposal.md e docs/supabase-pilot.md. Há API/Npgsql com health checks, banco local de teste e projeto Supabase separado criado gratuitamente. O provedor foi escolhido antes de implementar credenciais: não haverá ASP.NET Core Identity. A demo v6 permanece isolada.

## Goals / Non-Goals

Autenticação gerenciada e autorização própria, com configuração externa e verificação por testes assinados. Não oferecer cadastro público, permitir promoção por user_metadata, replicar o serviço Auth localmente ou declarar integração real pronta usando apenas mocks.

## Decisions

- JwtBearer nativo do ASP.NET Core valida tokens assimétricos contra o JWKS do emissor configurado; emissor, audiência, expiração e algoritmos são restritos. Não depender de um endpoint OpenID discovery que o serviço não documenta: buscar o JWKS documentado e usar o gerenciador de configuração/caches da biblioteca Microsoft.
- Papéis e vínculo residem no schema app, fora da Data API pública. Token sub identifica o usuário, mas não escolhe seu papel. Perfil sem vínculo ativo retorna acesso negado. O endpoint de sessão retorna apenas identidade e contexto autorizado; nunca dados de outro aluno.
- Cadastro mínimo de aluno é introduzido no B2, junto do convite, antes de ampliar o restante da rotina no 3C. Identificadores Auth e aluno são distintos, com restrições de unicidade e integridade. Convite precisa de acesso da professora e chave administrativa somente no servidor.
- Usar Npgsql com consultas parametrizadas para o pequeno vínculo de acesso e migrações SQL versionadas. Não acrescentar ORM antes de surgir benefício concreto para as operações. Os dados permanecem relacionais; histórico pedagógico pode preservar snapshots sem virar um documento de permissões editável pelo cliente.
- Frontend usa cliente oficial Supabase para entrada, saída, ativação/recuperação. Configuração publicável separada do segredo administrativo. Contexto autenticado é descartado ao mudar conta/sair; dados locais da demo não são importados automaticamente.
- Testes da API usam tokens realmente assinados e PostgreSQL real. Exercitar token errado, expiração, audiência, vínculo ausente/inativo e metadados falsos. Cliente/provedor podem ser simulados em testes específicos, mas conferência real do projeto fica como tarefa explícita.
- Configuração real de Auth/SMTP não está coberta pelas ferramentas de banco do plugin. Usar capacidades adequadas/painel e registrar o que depende de configuração externa; não enviar e-mails reais sem destinatário autorizado.

## Risks / Trade-offs

- Supabase Free pode pausar e não inclui backups automáticos → tratar recuperação e operação no 3E.
- JWT pode permanecer válido até expirar após ações no provedor → consultar vínculo ativo no servidor e respeitar renovação/expiração; revisar necessidade de invalidação imediata no piloto.
- Chave administrativa é privilegiada → manter somente na configuração do servidor, sem logs ou endpoint que a devolva.
- PostgreSQL local não contém Supabase Auth → testes assinados verificam a fronteira da API; teste real de login/convite exige projeto configurado e não será presumido.

## Migration Plan

Adicionar schema e vínculos sem tocar localStorage. Migrações são explícitas e transacionais. Primeiro usuário da professora é vinculado por procedimento administrativo com identificador Auth verificado; não por e-mail declarado no token ou pelo primeiro login. Conferir tabelas no projeto antes de aplicar DDL, políticas/grants e acesso negado depois. Não migrar dados reais até o 3E.
