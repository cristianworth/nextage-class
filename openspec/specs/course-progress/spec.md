# course-progress Specification

## Purpose

Acompanhar o ponto em que cada aluno está na sequência de aulas do material, permitindo que um conteúdo atravesse vários encontros da agenda.

## Requirements

### Requirement: Retomar conteúdo atual
O sistema SHALL sugerir a unidade atual do livro principal compatível do aluno, conforme os encontros anteriores daquele livro. Sem progresso SHALL começar na primeira unidade disponível. A professora SHALL poder selecionar outro conteúdo; apoio ou outro livro não SHALL substituir o principal cadastrado.

#### Scenario: Mesmo conteúdo em dois encontros
- **WHEN** a Unidade 3 é registrada em andamento na terça
- **THEN** o lançamento do encontro seguinte sugere a Unidade 3 do mesmo livro novamente.

### Requirement: Concluir e continuar
O sistema SHALL permitir indicar conclusão da unidade. Em andamento SHALL manter a unidade; concluída SHALL sugerir a próxima unidade do mesmo livro. A última SHALL indicar fim sem mudar nível ou livro automaticamente.

#### Scenario: Avançar após conclusão
- **WHEN** a professora registra que trabalhou e concluiu a Unidade 3
- **THEN** o histórico guarda a Unidade 3 e o próximo encontro sugere a Unidade 4 do mesmo livro, quando disponível.

#### Scenario: Material complementar ou falta
- **WHEN** um encontro recebe falta ou utiliza somente material de apoio
- **THEN** esse lançamento não avança nem apaga a sequência anterior.

### Requirement: Progresso cronológico e isolado
O sistema SHALL determinar progresso por data/hora efetiva, separado por aluno e livro. Editar o passado SHALL preservar o resultado posterior. Consultar aula antiga SHALL considerar só encontros anteriores. Trocar de nível dentro de um livro compatível SHALL manter a continuidade.

#### Scenario: Corrigir lançamento antigo
- **WHEN** a Unidade 4 já foi registrada depois e a professora corrige a Unidade 3 antiga
- **THEN** a sugestão atual continua baseada no encontro posterior do mesmo livro.

#### Scenario: Livro compartilhado e retomada
- **WHEN** o aluno muda de A1 para A2 num livro compatível com ambos ou volta a esse livro depois de usar outro
- **THEN** retoma o progresso desse livro sem reiniciar nem usar o resultado do outro.

### Requirement: Percurso flexível sem conclusão presumida
O sistema SHALL permitir selecionar uma unidade fora da ordem sugerida. A continuidade SHALL usar o resultado da unidade efetivamente trabalhada, sem registrar conclusão ou remover unidades omitidas. Uma unidade anterior SHALL continuar selecionável para retomada.

#### Scenario: Omitir gramática e retomar depois
- **WHEN** a professora seleciona Unidade 3 de conversação sem trabalhar Unidade 2 de gramática
- **THEN** o registro e a continuidade usam a Unidade 3 e a Unidade 2 permanece no acervo sem conclusão presumida, podendo ser selecionada depois.
