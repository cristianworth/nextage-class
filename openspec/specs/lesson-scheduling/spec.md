# lesson-scheduling Specification

## Purpose

Agendar e consultar ocorrências individuais de aula na grade aprovada, impedindo conflitos antes de introduzir recorrência ou remarcação.

## Requirements

### Requirement: Grade de aula pontual
O sistema SHALL agendar aulas para um aluno existente, em uma data válida de segunda a sexta, com início em hora cheia entre 07h e 22h, 55 minutos de aula e 5 de intervalo, no fuso de referência da demo.

#### Scenario: Último bloco
- **WHEN** a professora agenda uma aula às 22h em dia útil
- **THEN** a aula termina às 22h55 e o intervalo ocupa o restante até 23h.

#### Scenario: Horário ou dia inválido
- **WHEN** a data cai no fim de semana ou o horário está fora da grade
- **THEN** a operação é recusada com uma mensagem clara.

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

### Requirement: Consulta da agenda
O sistema SHALL permitir navegar entre semanas, retornar à semana atual e consultar aluno, data, horário e situação de cada aula. No celular SHALL oferecer consulta por dia.

#### Scenario: Abrir uma aula
- **WHEN** a professora seleciona uma aula na agenda
- **THEN** vê seus detalhes e o caminho para lançar ou editar seu registro quando permitido.
