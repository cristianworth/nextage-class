# Proposal

## Why

Cristian esclareceu que uma aula do material pode durar vários encontros. A professora precisa retomar o conteúdo atual do aluno no lançamento e decidir se continua nele ou conclui e avança, preservando o conteúdo efetivamente trabalhado.

## What Changes

- Numerar aulas do material dentro de cada nível e manter materiais complementares sem número.
- Sugerir o conteúdo atual do aluno no lançamento, independentemente do planejamento opcional por encontro.
- Registrar “em andamento” ou “concluída”; manter o conteúdo atual ou sugerir a próxima aula disponível na sequência.
- Mostrar o progresso nos detalhes da aula, cadastro/lista e histórico, distinguindo o trabalhado do próximo conteúdo.
- Calcular progresso pela data/hora dos encontros, sem deixar uma edição antiga substituir um lançamento posterior; faltas e materiais avulsos não avançam a sequência.
- Migrar a demo v3 sem presumir ordem ou conclusão para materiais/registros antigos.

## Capabilities

### New Capabilities

- `course-progress`: sequência de aulas do material e retomada por aluno.

### Modified Capabilities

- `material-library`: numeração e ordenação por nível, sem números duplicados.
- `lesson-history`: situação pedagógica e próxima sugestão separadas do conteúdo utilizado.
- `lesson-preparation`: exibir conteúdo atual do aluno junto do planejamento opcional.
- `demo-workspace`: migração do formato v3 preservando dados.

## Impact

Modelos, consultas de progresso, acervo, lançamento, histórico, detalhes/lista de alunos e armazenamento. Sem dependências novas, portal, backend ou mudança automática de nível. Este é um refinamento autorizado do 1C, antes da fase 2.
