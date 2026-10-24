# availability-blocking Specification

## Purpose

Reservar disponibilidade do professor por bloqueios manuais pontuais ou semanais, mantendo as aulas existentes e permitindo retirar bloqueios explicitamente.

## Requirements

### Requirement: Bloquear horários
O sistema SHALL permitir bloquear um intervalo de horas entre 07h e 23h em dia útil, uma vez ou semanalmente, com término opcional da repetição. Feriados SHALL depender de bloqueio manual.

#### Scenario: Bloquear o dia
- **WHEN** um bloqueio livre ocupa 07h até 23h
- **THEN** todos os blocos desse dia ficam ocupados e não podem receber aulas.

#### Scenario: Bloqueio semanal
- **WHEN** um bloqueio semanal é criado
- **THEN** a indisponibilidade aparece também nas semanas seguintes, respeitando seu término quando informado.

### Requirement: Conflito sem alteração automática
O sistema SHALL rejeitar bloqueio sobre aula existente ou outro bloqueio, informando o conflito e preservando os dados anteriores.

#### Scenario: Aula em semana distante
- **WHEN** um bloqueio semanal atingiria uma aula já marcada além da semana visível
- **THEN** o bloqueio não é salvo e a aula permanece intacta.

### Requirement: Remover bloqueio
O sistema SHALL permitir remover um bloqueio após confirmação explícita de seu alcance, sem alterar aulas ou gerar reposições.

#### Scenario: Retirar bloqueio semanal
- **WHEN** a professora confirma remover um bloqueio identificado como semanal
- **THEN** suas ocorrências deixam de ocupar a agenda, inclusive nas próximas semanas.
