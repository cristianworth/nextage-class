# Roadmap do Nextage Class

Revisado em 25/10/2026 após o aceite da etapa 2 e a definição de acesso por convite. Cada entrega distingue implementação técnica, revisão de uso e recursos ainda planejados. Sem estimativas de prazo artificiais.

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
| **3B — Contas e convites** | Entrada/saída, sessão, convite por e-mail/senha e recuperação; acesso restrito por papel | DEC-56; envio local fictício para testes, provedor real antes da implantação |
| **3C — Rotina da professora no servidor** | Cadastro, acervo, agenda, registros, preparação e homework persistidos pela API | Regras verificadas no servidor, conflitos sob concorrência e migrações |
| **3D — Aluno conectado** | Consulta própria, acervo e solicitações pela API com autorização por identidade | Reusar limites de compartilhamento; sem enviar documento completo ao aluno |
| **3E — Operação do piloto** | Backup/restauração verificados, configuração de implantação e revisão antes de dados reais | Definir hospedagem, envio de e-mail, retenção e recuperação com Cristian |

Os recortes serão divididos em chunks na mudança correspondente. A base local pode avançar sem contratar serviços. A publicação e o uso real dependem das decisões operacionais; não são presumidos por um teste local aprovado.

## Reavaliação e autonomia

Reavaliar o roadmap ao concluir cada etapa, a cada três chunks de uma etapa maior e imediatamente quando testes ou uso revelarem uma nova restrição. Primeiro corrigir regras/documentação afetadas, depois retomar a implementação. Cristian autorizou execução contínua em 25/10/2026: decisões rotineiras ficam com a assistência; ambiguidades materiais, tentativas repetidas sem progresso ou escolhas que dependam do uso devem voltar em pergunta com recomendação concreta.

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
