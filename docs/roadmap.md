# Roadmap do Nextage Class

Atualizado em 07/11/2026. Este quadro é a referência para a ordem e o estado atual; as seções posteriores registram o histórico e os documentos vinculados trazem contratos e evidências. “Concluído tecnicamente” significa que a assistência implementou e verificou; revisão pessoal opcional não bloqueia o próximo recorte.

## Onde estamos e o que vem depois

| Ordem | Etapa / recorte | Situação e resultado |
| --- | --- | --- |
| Concluído | **0–2 — Base e demo** | Rotina da professora e simulação do aluno aprovadas; demo pública independente. |
| Concluído tecnicamente | **3A — Servidor** | API e PostgreSQL locais executáveis. |
| Parcial | **3B — Contas: B1–B3** | Autenticação, convites e telas implementados; acesso real da professora confirmado. |
| Pendente em paralelo | **3B4 — Acesso real e recuperação** | Conferir recuperação e acesso/permissões de aluno reais, com identidade e destinatário alinhados. Mocks não encerram este recorte; não enviar convites por inferência. Necessário antes do uso real. [Detalhes](account-access.md). |
| Concluído tecnicamente | **3C1–3C4 — Rotina da professora** | Cadastro, acervo, agenda, registros, preparação, homework e continuidade conectados. Revisões opcionais estão [aqui](pending-human-testing.md). |
| Concluído tecnicamente | **3D1 — Aulas e histórico do aluno** | Consulta própria autorizada, com material e homework compartilhados. [Evidências](verification-3d1.md). |
| Concluído tecnicamente | **3D2 — Acervo e continuidade do aluno** | Conteúdo do nível atual e sugestão da sequência; leitura sem alterar progresso. [Evidências](verification-3d2.md). |
| Concluído tecnicamente | **3D3 — Disponibilidade e pedidos** | Aluno consulta horários e envia pedidos próprios, sem reserva enquanto pendentes. [Evidências](verification-3d3.md). |
| Próximo | **3D4 — Decisão da professora** | Aprovar ou recusar cada pedido, revalidando conflitos e gravando decisão e agenda juntas. |
| Depois do D4 | **3D5 — Integração** | Conferir o percurso completo, isolamento e regressões em computador e celular. |
| Antes de dados reais | **3E — Operação e acabamento** | Definir implantação e e-mail, verificar backup/restauração e revisar histórico/menu no computador e celular. Depende também do B4 real. |
| Condicionais | **4–6 — Evoluções futuras** | Integrações, recursos pedagógicos e expansão somente quando justificados. |

O desenvolvimento local do 3D pode avançar com identidades fictícias enquanto B4 permanece aberto. O uso real depende do B4 e do 3E. [Plano técnico do 3D](../openspec/changes/connect-student-portal-3d/tasks.md) detalha as tarefas; não substitui este quadro.
## Etapas e ordem

| Etapa | Resultado | Situação / critério de saída |
| --- | --- | --- |
| 0 — Fundação | Visão, decisões, Git, stack e OpenSpec | Concluída |
| 1 — Rotina do professor | Alunos, agenda, lançamento, preparação, sequências autorais e apoio | Entregue; aceite de Nara informado em 24/10/2026. [Fechamento](teaching-sequences.md) |
| 2 — Demo do aluno | Consulta das próprias aulas, histórico permitido, homework, acervo e solicitações | Concluída; revisão com Nara confirmada por Cristian em 25/10/2026. [Fechamento 2D](verification-2d.md) |
| 3 — Piloto com servidor | API ASP.NET Core/C#, PostgreSQL, contas e autorização, backup e recuperação | Usar dados reais somente após acesso restrito e restauração verificada. Preservar demo fictícia para portfólio |
| 4 — Integrações | Reuniões/calendário e lembretes conforme necessidade | Validar contas, permissões, falhas e valor no uso; link manual atende até lá |
| 5 — Evolução pedagógica | Arquivos, áudio, apresentação e melhorias justificadas pelo uso | Sem compromisso de implementar todas as ideias; especificar cada recorte antes |
| 6 — Expansão eventual | Vários professores e administração | Depende de demanda e separação de dados definida; fora do produto inicial |

A etapa 2 começa por leitura para validar o conteúdo compartilhado e sua apresentação antes de introduzir solicitações que alteram o estado. O piloto com servidor vem antes do uso cotidiano com pessoas reais.

## Demonstração pública de portfólio — prioridade em 29/10/2026

Cristian autorizou execução autônoma para preparar e publicar a demo das etapas 1/2 no GitHub Pages do repositório existente. O recorte inclui exemplos pedagógicos coerentes e restauráveis, armazenamento público separado, roteiro opcional, verificação dos fluxos em computador/celular e documentação de apresentação. Identidade visual atual preservada; apenas a demo estática é publicada.

Essa entrega antecede a retomada da validação B4 e não a conclui. O convite da professora expirou segundo o retorno informado por Cristian; um reenvio autorizado foi aceito pelo provedor em 29/10/2026. Ativação e entrada/saída da professora foram depois confirmadas por Cristian; recuperação e acesso do aluno continuam dependendo de conferência. Banco hospedado, piloto, 3C–3E e dados reais não fazem parte da publicação demonstrativa.

Demo [publicada e conferida](https://cristianworth.github.io/nextage-class/) em 29/10/2026. [Roteiro e política de datas](public-demo.md), [evidências novas](verification-public-demo.md) e mudança [publish-public-demo](../openspec/changes/publish-public-demo/proposal.md). Reavaliação: os fluxos das etapas 1/2 continuam adequados à apresentação; retomar B4 pelo resultado humano do acesso da professora. A publicação isoladamente não conclui B4; a retomada abaixo define o início incremental do 3C1 solicitado por Cristian.

## Etapa 2 dividida em entregas

| Chunk | Resultado | Dependências / conferência |
| --- | --- | --- |
| **2A — Consulta do aluno (entregue tecnicamente)** | Simulação de aluno, próximas aulas, link próprio, histórico permitido e homework em leitura | Material e homework compartilhados; conteúdo/observações livres reservados. Consulta própria sem edição ou gravação |
| **2B — Acervo para leitura (entregue tecnicamente)** | Unidades e apoios compatíveis, sequência atual e leitura dos conteúdos | Somente nível atual; versões antigas usadas em aula continuam no histórico. Abrir texto não marca leitura/conclusão nem altera progresso |
| **2C — Solicitações de horário (entregue tecnicamente)** | Combinar pedidos semanais/avulsos, acompanhar decisão; professora aprova/recusa cada horário | Pendente não reserva. Disponibilidade sem dados de outros alunos; aprovação revalida conflitos e cria aula/série uma única vez |
| **2D — Revisão dos dois lados (concluído)** | Percorrer professora → aluno → professora, recarga e celular | Aceite informado por Cristian em 25/10/2026; cenário integrado adicional aprovado |

## Trabalho do 2A — A1 a A4 concluídos tecnicamente

1. **A1 — Regras de compartilhamento e dados de consulta:** contrato com campos explícitos, próprios do aluno; excluir dados de cadastro desnecessários, planejamento e motivo de falta. Conteúdo/observações livres ficam com a professora, conforme resposta de Cristian.
2. **A2 — Entrada da simulação e próximas aulas:** seleção de aluno fictício, consulta de horários pontuais/semanais/remarcados, fuso de Brasília, link próprio e estados vazios.
3. **A3 — Histórico e homework em leitura:** registros próprios, material utilizado preservado e situação do homework; nenhum controle para editar aula ou marcar correção pelo aluno.
4. **A4 — Revisão técnica:** testar seleção entre alunos, cronologia, recorrência/remarcação, ausência de campos não compartilhados, recarga e celular; registrar evidências e manter a demo da professora funcionando.

Evidências e roteiro estão em [verification-2a.md](verification-2a.md). Revisão de uso do 2A permanece pendente; o aceite do 1F se refere à etapa 1.

A simulação não equivale a autenticação. A interface do aluno recebe somente o modelo de consulta; seleção de perfil e armazenamento local continuam ferramentas da demo, sem promessa de isolamento seguro no navegador.

## Trabalho do 2B — B1 a B3 concluídos tecnicamente

1. **B1 — Consulta compatível:** contrato explícito por aluno, filtro pelo nível atual, herança de níveis das sequências e continuidade derivada dos lançamentos.
2. **B2 — Meu acervo:** unidades agrupadas por sequência, apoios, busca/tipo e leitura em painel, sem edição ou gravação. Troca de aluno descarta o contexto anterior.
3. **B3 — Revisão:** acesso após promoção, cópias históricas, conteúdo literal, ordem numérica, recarga, celular e regressões. Ver [verification-2b.md](verification-2b.md).

## Trabalho do 2C — C1 a C4

1. **C1 — Regras e persistência:** pedidos independentes, avulsos ou semanais com término opcional; disponibilidade em todo o período; decisão única; migração v1–v5 para v6 sem reset. Contrato em [scheduling-requests.md](scheduling-requests.md).
2. **C2 — Pedido pelo aluno:** horas livres, envio e acompanhamento próprio; combinação de dias com um envio por horário, sem reserva enquanto pendente.
3. **C3 — Decisão pela professora:** lista de pendências, filtros, aprovação/recusa por pedido, nova conferência de conflito e preservação do estado em erro.
4. **C4 — Revisão técnica integrada:** testes de ambos os lados, recarga, falhas e celular; evidências em [verification-2c.md](verification-2c.md).

O **2D está concluído**: revisão de uso confirmada por Cristian e cenário integrado adicional aprovado. Verificação automatizada e aceite humano continuam registrados separadamente em [verification-2d.md](verification-2d.md).

## Etapa 3 — Piloto com servidor

| Recorte | Resultado verificável | Dependência |
| --- | --- | --- |
| **3A — Base executável (concluído tecnicamente)** | ASP.NET Core, conexão PostgreSQL, configuração externa, saúde do serviço e testes com banco real | [Evidências 3A](verification-3a.md); demo preservada e ferramentas locais sem credenciais no Git |
| **3B — Contas e convites (em implementação)** | Supabase Auth para entrada/saída, convite por e-mail/senha e recuperação; API valida identidade e permissões | DEC-56/57; projeto gratuito criado em São Paulo. Cadastro público desabilitado e envio de e-mail configurado antes de convites reais |
| **3C — Rotina da professora no servidor** | Cadastro, acervo, agenda, registros, preparação e homework persistidos pela API | Regras verificadas no servidor, conflitos sob concorrência e migrações |
| **3D — Aluno conectado** | Consulta própria, acervo e solicitações pela API com autorização por identidade | Reusar limites de compartilhamento; sem enviar documento completo ao aluno |
| **3E — Operação do piloto** | Backup/restauração verificados, configuração de implantação e revisão antes de dados reais | Definir hospedagem, envio de e-mail, retenção e recuperação com Cristian |

Os recortes serão divididos em chunks na mudança correspondente. A base local pode avançar sem contratar serviços. A publicação e o uso real dependem das decisões operacionais; não são presumidos por um teste local aprovado.

### Reavaliação no início do 3B

Cristian escolheu Supabase para banco e autenticação. A base PostgreSQL/Npgsql continua válida; não haverá ASP.NET Core Identity nem um cadastro paralelo de senhas. Supabase comprova a identidade e a API mantém o vínculo com o aluno e o papel permitido, sem confiar em permissões editáveis pelo navegador. Ver [supabase-pilot.md](supabase-pilot.md).

Divisão do 3B: **B1** contrato e validação de identidade/permissões no servidor; **B2** vínculo com cadastro e convite restrito à professora; **B3** telas de entrada/ativação/recuperação e sessão; **B4** conferência local e com o projeto Supabase, incluindo acessos negados. O cadastro mínimo necessário ao vínculo entra junto de B2; o restante da rotina permanece no 3C. Revisar o plano ao completar B3, antes da conferência integrada.

### Reavaliação após B3

B1–B3 estão implementados; B4 continua aberto. O cadastro público foi desativado e confirmado no projeto real. Os testes locais cobrem as fronteiras de permissão e os fluxos da interface, com provedor simulado. O plano continua adequado: a rotina da professora entra no 3C e a do aluno no 3D, sem importar dados locais automaticamente.

No B4, a chave privada já foi configurada e aceita; identidade inicial e vínculo teacher foram verificados, o retorno de ativação foi conferido e o provedor aceitou o primeiro convite de teste autorizado. Falta conferir recebimento, ativação, login e recuperação no uso real. O SMTP padrão serve apenas para testes limitados; configurar envio a alunos antes do uso real. Não ampliar o produto nem declarar acesso completo usando mocks ou apenas uma confirmação de envio. Detalhes em [verification-3b.md](verification-3b.md).

O provisionamento da primeira conta também exige separar o banco dos testes automatizados do banco de desenvolvimento. Os testes criam sua própria professora fictícia, e o produto permite uma única professora; compartilhar o banco causaria conflito com a conta provisionada. A preparação local deve manter nextage_class para desenvolvimento e nextage_class_tests para testes, sem apagar ou substituir o vínculo existente.

## Histórico de reavaliações e autonomia

### Retomada após o acesso da professora — 29/10/2026

Cristian confirmou que definiu a senha, abriu a área de alunos/cadastro e conseguiu sair e entrar novamente. O cadastro vazio é esperado: a demo e o piloto têm dados separados. Isso valida o acesso da professora, mas recuperação e fluxo real do aluno ainda mantêm B4 aberto.

Cristian solicitou replanejar e iniciar a próxima implementação. A demo pública passa a ser referência executável e fonte de cenários fictícios para testes; não será importada automaticamente para a conta autenticada. O início incremental do 3C1 pode usar o acesso teacher já validado enquanto as pendências externas do B4 ficam visíveis. O fechamento do B4 continua necessário antes de validar o portal autenticado 3D ou uso real.

| Ordem | Recorte | Resultado e dependência |
| --- | --- | --- |
| Concluído | **3C1 — Cadastro conectado** | Cadastro/edição pela API conferidos e aprovados por Cristian; máscara com DDD acrescentada. Identidade e convites preservados |
| Em paralelo no planejamento | **B4 restante** | Conferir recuperação real e acesso/permissões de aluno com identidade/destinatário de teste alinhados. Não enviar convites novos por inferência |
| Histórico (concluído tecnicamente) | **3C2 — Acervo e vínculo pedagógico** | Sequências, unidades, apoios e sequência principal implementados e conferidos tecnicamente; revisão de uso pendente. Histórico/progresso conectados entram no 3C4 |
| Histórico (concluído tecnicamente) | **3C3 — Agenda no servidor** | Aulas pontuais e semanais, bloqueios e remarcações conectados. Conferência técnica concluída e revisão de uso sugerida |
| Concluído tecnicamente | **3C4 — Registros e preparação** | Lançamento, histórico e preparação aprovados por Cristian; homework e continuidade por aluno e livro conferidos tecnicamente. Revisão pessoal é opcional. [Lançamento](verification-3c4-first-slice.md) · [Preparação](verification-3c4-preparation.md) · [Homework](verification-3c4-homework.md) · [Continuidade](verification-3c4-progress.md) |
| Em implementação | **3D — Portal conectado** | D1 consulta própria, D2 acervo e D3 pedidos concluídos tecnicamente; D4 decisão é o próximo recorte. [Proposta e recortes](../openspec/changes/connect-student-portal-3d/proposal.md) · [Evidências D1](verification-3d1.md). B4 real continua necessário para validar acesso do aluno |
| Antes de dados reais | **3E — Operação** | Banco hospedado, implantação do piloto, e-mail operacional, backup/restauração e revisão de uso e acabamento visual do piloto |

Na revisão do primeiro recorte do 3C4 em 05/11/2026, Cristian apontou transbordamento de descrição no histórico e navegação do piloto visualmente diferente da demo. Corrigir o transbordamento e revisar a organização do menu tomando a demo como referência antes do uso real; a revisão de acabamento visual deve cobrir computador e celular. Esses pontos não impedem a continuidade funcional do 3C4.

Reavaliação em 06/11/2026: os recortes do 3C4 foram conectados e verificados tecnicamente, incluindo continuidade. Cristian validou registros e preparação; pode revisar homework e continuidade quando desejar. A próxima etapa do roadmap é o portal conectado 3D; a validação real do aluno e recuperação do B4 e a operação do 3E continuam em seus próprios escopos, sem criação de contas ou convites por inferência.

Primeiro recorte: [connect-teacher-students-3c1](../openspec/changes/connect-teacher-students-3c1/proposal.md). Demo pública permanece estática e independente; nova publicação do piloto não está autorizada por esta reordenação.

Atualização em 04/11/2026: Cristian solicitou continuar a implementação e receber pedidos de validação com instruções claras. O 3C1 está implementado; completar sua conferência navegador → API → PostgreSQL em ambiente de testes isolado antes de pedir revisão de uso. Testes técnicos repetitivos são responsabilidade da assistência. A revisão verifica adequação do cadastro; Cristian pode dispensá-la explicitamente. B4 mantém recuperação e identidade real do aluno pendentes; a conferência integrada com identidade fictícia não os encerra.

Aceite posterior em 04/11/2026: Cristian confirmou que o cadastro atende, solicitou máscara de telefone com DDD e autorizou avançar ao acervo 3C2. O marco de revisão do 3C1 está cumprido. Próximo resultado: sequências, unidades numeradas, apoios e sequência principal persistidos pela API, reutilizando a demo como referência. Commits e push foram autorizados quando necessários, com verificações da entrega.

Reavaliação após os três recortes do 3C2: acervo e vínculo principal estão implementados e conferidos com API/PostgreSQL reais em computador/celular. Migração aditiva local preservou os dados existentes; nenhuma conta ou exemplo foi importado. Revisão de uso sugerida em [verification-3c2.md](verification-3c2.md). A ordem segue adequada: revisar acervo, conectar agenda 3C3 e depois registros/preparação 3C4. B4 permanece aberto; banco hospedado, envio operacional, backup/restauração e implantação continuam no 3E.

Em 05/11/2026, Cristian autorizou seguir à próxima implementação. O 3C3 concluiu os três recortes de persistência, interface e conferência integrada. A migração 004 foi aplicada somente ao PostgreSQL local e preservou os dados anteriores. A ordem segue adequada. Revisar a agenda e conectar os registros e a preparação no 3C4. A revisão de uso do acervo e a validação do B4 continuam registradas separadamente. [Evidências e roteiro do 3C3](verification-3c3.md).

### Passagem do 3B em 26/10/2026

Cristian solicitou preparar o handoff e continuar a partir do 3B, sem concluir sua implementação neste chat. B1–B3 permanecem concluídos e B4 aberto. Primeiro o sucessor confere o estado e alinha um recorte pequeno; depois completa a validação do acesso antes de avançar ao 3C. A criação de contas fictícias com senha conhecida e a ordem da conexão ao PostgreSQL hospedado foram propostas recentes, não tarefas já executadas ou decisões confirmadas. Não é necessário executar toda a lista discutida para realizar a passagem. Contexto, evidências e protocolo em [handoff do 3B](handoffs/2026-10-26-resume-3b.md).

Reavaliar o roadmap ao concluir cada etapa, a cada três chunks de uma etapa maior e imediatamente quando testes ou uso revelarem uma nova restrição. Primeiro corrigir regras/documentação afetadas, depois retomar a implementação. Cristian autorizou execução contínua em 25/10/2026: decisões rotineiras ficam com a assistência; ambiguidades materiais, tentativas repetidas sem progresso ou escolhas que dependam do uso devem voltar em pergunta com recomendação concreta.

Em 06/11/2026, Cristian confirmou que a assistência deve executar as verificações e seguir após os comportamentos definidos passarem, sem exigir revisão humana em cada entrega. As revisões pessoais opcionais ficam reunidas em [Pendente de Teste](pending-human-testing.md); não confundir essa lista com as validações reais obrigatórias de B4 e 3E.

Reavaliação após D1 em 06/11/2026: a consulta autenticada de aulas e histórico foi conectada e conferida com identidades fictícias; acervo e solicitações permanecem ocultos no piloto até seus próprios recortes. D2 (acervo e continuidade) e D3 (disponibilidade e pedidos) foram concluídos tecnicamente; prosseguir para D4 (decisão da professora). A revisão pessoal é opcional; B4 real e operação 3E seguem abertos. [Evidências D1](verification-3d1.md).

Etapas 4–6 permanecem evoluções condicionais. Não transformar possibilidades adiadas em obrigações para declarar o produto concluído.

## O que permanece simples

- Uma sequência principal por aluno e uma seleção de conteúdo por registro.
- Unidade em andamento/concluída e percurso livre, sem concluir unidades omitidas automaticamente.
- Homework com uma descrição e correção inteira, sem envio de arquivos ou ampliação do fluxo.
- Leitura do acervo entregue no 2B; andamento/conclusão da unidade mantém o funcionamento atual.

## Ideias registradas, sem prioridade atual

Cristian confirmou em 25/10/2026 que não precisa agora de unidades dispensadas/adiadas por aluno nem de unidade principal com vários apoios no mesmo encontro. São casos específicos; o fluxo atual é suficiente.

Essas possibilidades ficam na etapa 5 para eventual discussão, sem bloquear a etapa 2. Percentuais, objetivos/tags estruturados ou editor rico também não serão acrescentados por conveniência.

## Limites mantidos

Um professor, adultos, aulas individuais e um fuso. Sem IA no produto, reposição, saldo/créditos, cobrança ou migração automática do sistema utilizado pela professora. Turmas, menores, vários fusos, streak e fim de semana continuam fora do escopo inicial.

## Evidências da etapa 1

[1A](verification-1a.md), [1B](verification-1b.md), [1C](verification-1c.md), [1D](verification-1d.md), [1E](verification-1e.md) e [fechamento](teaching-sequences.md). São registros históricos dos recortes; requisitos atuais estão em `openspec/specs/` e mudanças concluídas em `openspec/changes/archive/`.
