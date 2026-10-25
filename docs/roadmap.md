# Roadmap do Nextage Class

Revisado em 25/10/2026 com as decisões da etapa 1. Cada entrega distingue implementação técnica, revisão de uso e recursos ainda planejados. Sem estimativas de prazo artificiais.

## Etapas e ordem

| Etapa | Resultado | Situação / critério de saída |
| --- | --- | --- |
| 0 — Fundação | Visão, decisões, Git, stack e OpenSpec | Concluída |
| 1 — Rotina do professor | Alunos, agenda, lançamento, preparação, sequências autorais e apoio | Entregue; aceite de Nara informado em 24/10/2026. [Fechamento](teaching-sequences.md) |
| 2 — Demo do aluno | Consulta das próprias aulas, histórico permitido, homework e acervo; depois solicitações | 2A entregue tecnicamente; revisão de uso pendente. 2B/2C/2D planejados, com perfis explicitamente simulados |
| 3 — Piloto com servidor | API ASP.NET Core/C#, PostgreSQL, contas e autorização, backup e recuperação | Usar dados reais somente após acesso restrito e restauração verificada. Preservar demo fictícia para portfólio |
| 4 — Integrações | Reuniões/calendário e lembretes conforme necessidade | Validar contas, permissões, falhas e valor no uso; link manual atende até lá |
| 5 — Evolução pedagógica | Arquivos, áudio, apresentação e melhorias justificadas pelo uso | Sem compromisso de implementar todas as ideias; especificar cada recorte antes |
| 6 — Expansão eventual | Vários professores e administração | Depende de demanda e separação de dados definida; fora do produto inicial |

A etapa 2 começa por leitura para validar o conteúdo compartilhado e sua apresentação antes de introduzir solicitações que alteram o estado. O piloto com servidor vem antes do uso cotidiano com pessoas reais.

## Etapa 2 dividida em entregas

| Chunk | Resultado | Dependências / conferência |
| --- | --- | --- |
| **2A — Consulta do aluno (entregue tecnicamente)** | Simulação de aluno, próximas aulas, link próprio, histórico permitido e homework em leitura | Material e homework compartilhados; conteúdo/observações livres reservados. Consulta própria sem edição ou gravação |
| **2B — Acervo para leitura** | Unidades e apoios compatíveis, sequência atual e leitura dos conteúdos | Decidir acesso após mudança de nível. Reutilizar o acervo e a conclusão atual; não criar dispensa nem vários materiais por registro |
| **2C — Solicitações de horário** | Solicitar horário e acompanhar decisão; professora aprova/recusa | Definir avulsa/recorrente e regras de aprovação antes de depender delas. Expor disponibilidade sem identificar outros alunos; aprovação revalida conflitos |
| **2D — Revisão dos dois lados** | Percorrer professora → aluno → professora, recarga e celular | Validação de uso com Nara/Cristian; corrigir o que impedir o fluxo antes do servidor |

## Trabalho do 2A — A1 a A4 concluídos tecnicamente

1. **A1 — Regras de compartilhamento e dados de consulta:** contrato com campos explícitos, próprios do aluno; excluir dados de cadastro desnecessários, planejamento e motivo de falta. Conteúdo/observações livres ficam com a professora, conforme resposta de Cristian.
2. **A2 — Entrada da simulação e próximas aulas:** seleção de aluno fictício, consulta de horários pontuais/semanais/remarcados, fuso de Brasília, link próprio e estados vazios.
3. **A3 — Histórico e homework em leitura:** registros próprios, material utilizado preservado e situação do homework; nenhum controle para editar aula ou marcar correção pelo aluno.
4. **A4 — Revisão técnica:** testar seleção entre alunos, cronologia, recorrência/remarcação, ausência de campos não compartilhados, recarga e celular; registrar evidências e manter a demo da professora funcionando.

Evidências e roteiro estão em [verification-2a.md](verification-2a.md). Revisão de uso do 2A permanece pendente; o aceite do 1F se refere à etapa 1.

A simulação não equivale a autenticação. A interface do aluno recebe somente o modelo de consulta; seleção de perfil e armazenamento local continuam ferramentas da demo, sem promessa de isolamento seguro no navegador.

## O que permanece simples

- Uma sequência principal por aluno e uma seleção de conteúdo por registro.
- Unidade em andamento/concluída e percurso livre, sem concluir unidades omitidas automaticamente.
- Homework com uma descrição e correção inteira, sem envio de arquivos ou ampliação do fluxo.
- Leitura do acervo fica no 2B; andamento/conclusão da unidade mantém o funcionamento atual.

## Ideias registradas, sem prioridade atual

Cristian confirmou em 25/10/2026 que não precisa agora de unidades dispensadas/adiadas por aluno nem de unidade principal com vários apoios no mesmo encontro. São casos específicos; o fluxo atual é suficiente.

Essas possibilidades ficam na etapa 5 para eventual discussão, sem bloquear a etapa 2. Percentuais, objetivos/tags estruturados ou editor rico também não serão acrescentados por conveniência.

## Limites mantidos

Um professor, adultos, aulas individuais e um fuso. Sem IA no produto, reposição, saldo/créditos, cobrança ou migração automática do sistema utilizado pela professora. Turmas, menores, vários fusos, streak e fim de semana continuam fora do escopo inicial.

## Evidências da etapa 1

[1A](verification-1a.md), [1B](verification-1b.md), [1C](verification-1c.md), [1D](verification-1d.md), [1E](verification-1e.md) e [fechamento](teaching-sequences.md). São registros históricos dos recortes; requisitos atuais estão em `openspec/specs/` e mudanças concluídas em `openspec/changes/archive/`.
