# Spec Delta

## ADDED Requirements

### Requirement: Agenda persistida da professora

O servidor SHALL permitir à professora ativa consultar a agenda e gravar aulas pontuais, séries semanais e bloqueios. SHALL aplicar a grade de segunda a sexta, entre 07h e 23h no fuso de Brasília, conforme as regras existentes de aulas e bloqueios.

#### Scenario: Série sem término após recarregar
- **WHEN** a professora agenda um horário fixo sem término e consulta uma semana distante depois de recarregar
- **THEN** a ocorrência aparece uma vez no dia correto, com identidade estável.

#### Scenario: Duas gravações conflitantes
- **WHEN** duas abas tentam ocupar o mesmo horário, inclusive por regras semanais que só se encontram mais adiante
- **THEN** a API confirma apenas a primeira gravação válida e informa o conflito à outra aba.

#### Scenario: Remover bloqueio
- **WHEN** a professora confirma a remoção de um bloqueio semanal
- **THEN** suas ocorrências futuras ficam livres e as aulas são preservadas.

### Requirement: Remarcação coerente da ocorrência

O servidor SHALL aceitar mudança individual e, em série semanal, mudança da ocorrência selecionada e das seguintes. SHALL preservar o identificador de cada ocorrência, os horários já iniciados e os dados anteriores diante de conflito ou seleção desatualizada.

#### Scenario: Alterar o restante da série
- **WHEN** uma mudança válida alcança uma exceção futura
- **THEN** a exceção é substituída pelo novo horário e aulas iniciadas permanecem em seus horários.

#### Scenario: Seleção desatualizada
- **WHEN** uma aba envia remarcação sobre data ou horário que outra aba já modificou
- **THEN** a API recusa a operação e solicita que a professora atualize a agenda.
