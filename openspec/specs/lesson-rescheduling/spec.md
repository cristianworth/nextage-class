# lesson-rescheduling Specification

## Purpose

Trocar datas e horários de aulas existentes de forma pontual ou para o restante da série, sem criar reposições nem reescrever o passado.

## Requirements

### Requirement: Alcance da remarcação
O sistema SHALL oferecer “somente esta aula” e “esta e as próximas” para aula semanal, selecionando somente esta aula por padrão. Aula pontual SHALL permitir somente alteração individual.

#### Scenario: Alteração individual
- **WHEN** uma aula de terça é movida para quinta usando a seleção padrão
- **THEN** somente aquela ocorrência muda, sem duplicação, e as demais terças são preservadas.

### Requirement: Alterar o futuro da série
O sistema SHALL aplicar o novo horário à ocorrência selecionada e às seguintes quando esse alcance for escolhido, substituindo também remarcações individuais futuras dessa série.

#### Scenario: Substituir exceção futura
- **WHEN** uma terça futura já havia sido trocada para quinta e a série passa para quarta
- **THEN** aquela aula passa para quarta junto das demais e não permanece também na quinta.

### Requirement: Preservar o passado
O sistema SHALL impedir remarcação de aulas iniciadas ou registradas e preservar o horário de aulas passadas e registros ao alterar uma série futura.

#### Scenario: Registro anterior
- **WHEN** o horário fixo muda a partir de uma ocorrência futura
- **THEN** aulas anteriores e registros mantêm seus identificadores, datas e conteúdo.

### Requirement: Remarcação atômica
O sistema SHALL validar o novo horário e todos os conflitos antes de salvar uma remarcação, preservando a agenda inteira se alguma aula futura conflitar. Remarcação SHALL mover aulas existentes, sem criar créditos ou reposições.

#### Scenario: Conflito após algumas semanas
- **WHEN** uma mudança de série encontraria um horário ocupado mais adiante
- **THEN** nenhuma parte da mudança é aplicada e a interface indica o conflito.
