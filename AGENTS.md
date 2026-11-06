# Working on Nextage Class

## Collaboration

- Converse em português com Cristian. Use inglês natural para novos identificadores, nomes de arquivos, testes e comentários técnicos. A documentação de produto e os textos da interface começam em português.
- Preferência atual: Cristian guia o produto, acompanha decisões e valida entregas; a assistência de IA implementa e verifica. Não reservar tarefas para Cristian programar, a menos que ele peça. Explique escolhas relevantes para que ele consiga acompanhar o desenvolvimento.
- Para revisão prática, a assistência prepara o ambiente: encerra e reinicia a API do projeto quando necessário, inicia o piloto e os serviços necessários e confere que estão acessíveis antes de entregar o roteiro a Cristian.
- IA auxilia o desenvolvimento. Não adicione recursos de IA ao produto.
- Estado atual: etapas 1 e 2 concluídas. Aceite do 1F informado por Cristian em 24/10/2026; revisão integrada com Nara confirmada em 25/10/2026 (DEC-55). Dados locais v6; sequências autorais, percurso flexível, homework simples, consulta própria e acervo do nível atual com histórico preservado. Pedidos avulsos/semanais são independentes e combináveis; aprovação obrigatória, sem reserva enquanto pendentes. Próximo ciclo: piloto 3A–3E com ASP.NET Core/PostgreSQL; acesso por convite e e-mail/senha, sem cadastro público (DEC-56). Não confundir unidade do material com encontro da agenda.
- Autonomia atual: Cristian autorizou execução contínua pelo roadmap em 25/10/2026. Reavaliar plano após cada etapa, a cada três chunks e ao surgir nova restrição. Atualizar documentos primeiro, depois continuar. Perguntar com recomendação quando depender da visão do usuário, houver ambiguidade material ou repetição sem progresso. Etapas condicionais 4–6 não viram escopo obrigatório automaticamente.
- Servidor: base 3A executável em api/, SDK 10.0.402 e PostgreSQL 18.6 locais em work/toolchain. Scripts em scripts/; conexão e dados fictícios em work/postgres. Não imprimir configuração privada. Recorte 3B com identidade, cadastro/convites e telas de acesso implementados; recuperação e acesso real do aluno pendentes. Rotina completa no servidor entra no 3C/3D. Demo continua independente. Evidências em docs/verification-3a.md e docs/verification-3b.md.
- Atualização do 3B: Supabase para banco e Auth foi aprovado por Cristian (DEC-57); projeto separado gratuito criado em São Paulo (DEC-58). Não implementar ASP.NET Core Identity ou senhas próprias. A API mantém regras, valida tokens e vínculo/papel do aluno; nunca confiar em user_metadata editável para conceder acesso. Chave administrativa fica somente no servidor. Configuração real e cadastro público precisam de verificação antes de convites reais. Não usar o projeto GachaManagement.
- B1 do 3B implementado: GET /api/session exige JWT válido e perfil ativo do schema app. Migrações 001/002 em database/migrations, aplicadas no banco local e projeto Supabase do Nextage Class; RLS sem políticas públicas é intencional, app sem USAGE para anon/authenticated. Dezenove testes HTTP aprovados. B2 (cadastro/convite) e B3 (telas de acesso) implementados e verificados localmente; B4 segue pendente; cadastro público desativado por Cristian e confirmado por consulta real em 25/10/2026 (e-mail habilitado, confirmação mantida). Chave administrativa configurada e aceita; conta inicial teacher verificada e primeiro convite aceito pelo provedor. Cristian confirmou ativação e entrada/saída da professora em 29/10/2026; recuperação e acesso do aluno continuam pendentes. Banco nextage_class_tests separado do desenvolvimento para preservar essa conta. Ver docs/account-access.md. Não declarar login/convites completos.

## Sources of truth

- 3C3 em 05/11/2026. Cristian autorizou avançar à agenda. API, grade e remarcações implementadas e conferidas com 37 testes HTTP e dois percursos integrados. Migração 004 aplicada e repetida no banco local com os dados anteriores preservados. O 3C4 conecta registros e preparação. Revisão de uso e B4 seguem conforme docs/verification-3c3.md e docs/roadmap.md.

- 3C2 em 04/11/2026: acervo e vínculo principal implementados e conferidos tecnicamente (31 HTTP, dois cenários navegador/API/banco reais, 14 simulados do piloto; regressões da demo aprovadas). Migração 003 aplicada/repetida somente no banco local, dados anteriores preservados. Revisão de uso sugerida antes da agenda 3C3; registros/progresso no servidor continuam no 3C4. Não declarar B4 ou piloto completo. Ver docs/verification-3c2.md.

- Aceite em 04/11/2026: Cristian aprovou o cadastro 3C1, pediu máscara de telefone com DDD e autorizou seguir ao acervo 3C2. Commits e push estão liberados quando necessários, após as verificações relevantes; não criar atividade artificial. Essa autorização não implica contratar serviços ou publicar o piloto. B4 segue aberto para recuperação e aluno reais.

- Continuação em 04/11/2026: Cristian reforçou que a assistência deve implementar e executar as verificações técnicas, solicitando validação humana com objetivo/passos/resultado esperado. O 3C1 passou na conferência navegador → API → PostgreSQL isolado em computador/celular; emissão de identidade simulada, sem conta ou e-mail novo. Revisão de uso do cadastro antecede o 3C2 e pode ser dispensada explicitamente. B4 continua aberto para recuperação e aluno reais. Ver docs/verification-3c1.md.

- Retomada em 29/10/2026: Cristian validou definição da senha, acesso da professora, saída e nova entrada. Cadastro vazio é esperado; preservar a separação de dados. Pedido atual autoriza replanejar e iniciar 3C1 (cadastro/edição pela API), usando a demo como referência de comportamento e testes. B4 permanece aberto para recuperação e acesso do aluno; não criar contas nem enviar convites adicionais por inferência. Ver reavaliação em docs/roadmap.md.

- Prioridade autorizada em 29/10/2026: demo pública de portfólio das etapas 1/2, com execução autônoma, commits/push e GitHub Pages gratuito no repositório existente. Publicada e conferida em computador/celular; ver docs/public-demo.md e docs/verification-public-demo.md. Modo public-demo e armazenamento próprio preservam os dados anteriores e o piloto. O pedido atual substitui a ordem anterior para esta entrega; B4 permanece aberto. Reenvio autorizado do convite da professora foi aceito pelo provedor; ativação e entrada/saída foram depois confirmadas por Cristian.

- Continuação solicitada em 26/10/2026: retomar o 3B pelo handoff em docs/handoffs/2026-10-26-resume-3b.md. Primeiro diagnóstico/plano e validação, depois primeiro recorte e revisão antes de ampliar. A preparação desta passagem não implementa o restante do B4. Propostas de alunos fictícios e conexão do banco hospedado ainda precisam de alinhamento; não tratá-las como realizadas. Respeitar pedidos de análise/perguntas sem implementação.

- Leia `README.md`, `docs/decisions.md` e `docs/roadmap.md` antes de propor trabalho.
- `docs/` contém visão, decisões, planejamento e perguntas; não afirma que funcionalidades existem.
- `openspec/specs/` fica reservado ao comportamento já entregue. `openspec/changes/` reúne propostas em andamento.
- Não promova proposta a requisito implementado antes da validação correspondente. Atualize a decisão canônica em vez de manter cópias divergentes.
- Diferencie decisões validadas, sugestões e questões abertas. Faça perguntas de arquitetura antes de depender da resposta; deixe detalhes de tela para a mudança correspondente.

## Development and version control

- Use OpenSpec de forma proporcional. Uma alteração pequena não exige uma proposta de produto inteira.
- Não crie branches adicionais sem pedido de Cristian. Cristian autorizou commits e push quando necessários, após as verificações pertinentes; agrupe alterações em entregas coesas. Essa autorização não inclui configurar remoto, contratar serviços ou publicar o piloto.
- Antes de commit ou merge, procure changelog e regras de versionamento. Se existir changelog, avalie a versão e pergunte sobre sua atualização, salvo autorização já dada para a entrega.
- Preserve dados locais, credenciais, acervos privados, imagens de referência e arquivos temporários fora do histórico. A demo usa somente conteúdo fictício ou autorizado para publicação.
- Valide o comportamento relevante e efeitos plausíveis. Revisão por IA e validação estrutural de OpenSpec não substituem testes ou conferência prática.
- Não introduza frameworks, serviços ou abstrações extras sem uma necessidade demonstrada. A stack validada está em `docs/architecture.md`.
- Mantenha nomes claros, responsabilidades coesas e regras fora dos componentes quando houver uma fronteira real. Use Clean Code de forma proporcional, sem camadas, interfaces ou padrões apenas por cerimônia. Trate erros e teste o comportamento relevante.
