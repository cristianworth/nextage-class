# course-progress Specification

## Purpose

Acompanhar o ponto em que cada aluno está na sequência de aulas do material, permitindo que um conteúdo atravesse vários encontros da agenda.

## Requirements

### Requirement: Retomar conteúdo atual
O sistema SHALL sugerir no lançamento a aula do material atual daquele aluno e nível, conforme os encontros anteriores. Sem progresso registrado, SHALL sugerir a primeira aula numerada disponível. A professora SHALL poder escolher outro conteúdo efetivamente trabalhado.

#### Scenario: Mesmo conteúdo em dois encontros
- **WHEN** a Aula 3 é registrada em andamento na terça
- **THEN** o lançamento do encontro seguinte sugere a Aula 3 novamente.

### Requirement: Concluir e continuar
O sistema SHALL permitir indicar que a aula do material foi concluída. Em andamento SHALL manter o mesmo conteúdo; concluída SHALL sugerir a próxima aula numerada disponível no nível. A última aula SHALL indicar fim da sequência sem mudar o nível automaticamente.

#### Scenario: Avançar após conclusão
- **WHEN** a professora registra que trabalhou e concluiu a Aula 3
- **THEN** o histórico guarda a Aula 3 e o próximo encontro sugere a Aula 4, quando disponível.

#### Scenario: Material complementar ou falta
- **WHEN** um encontro recebe falta ou utiliza somente material sem número
- **THEN** esse lançamento não avança nem apaga a sequência anterior.

### Requirement: Progresso cronológico e isolado
O sistema SHALL determinar o progresso pela data/hora efetiva dos encontros, separado por aluno e nível. Editar um registro antigo SHALL atualizar seu histórico sem substituir o resultado de encontros posteriores. Ao consultar uma aula antiga, SHALL considerar apenas encontros anteriores a ela.

#### Scenario: Corrigir lançamento antigo
- **WHEN** a Aula 4 já foi registrada em encontro posterior e a professora corrige a Aula 3 antiga
- **THEN** a sugestão atual continua baseada no encontro posterior.
