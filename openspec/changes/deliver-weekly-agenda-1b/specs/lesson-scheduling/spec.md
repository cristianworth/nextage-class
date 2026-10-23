## MODIFIED Requirements

### Requirement: Prevenção de conflito
O sistema SHALL impedir sobreposição entre aulas pontuais, séries e bloqueios durante toda sua validade, considerando o intervalo e preservando o estado anterior ao rejeitar a solicitação.

#### Scenario: Duas aulas no mesmo horário
- **WHEN** uma nova aula tenta ocupar um bloco já agendado na mesma data
- **THEN** a interface identifica o conflito e mantém apenas a aula já existente.

#### Scenario: Bloco seguinte
- **WHEN** há aula às 09h e uma nova é marcada às 10h na mesma data
- **THEN** ambas são aceitas porque a primeira aula e seu intervalo terminam às 10h.

#### Scenario: Conflito fora da semana visível
- **WHEN** uma série sem término atingiria uma aula pontual ou série em semana distante
- **THEN** a criação é rejeitada com a data do conflito, sem salvar parcialmente.
