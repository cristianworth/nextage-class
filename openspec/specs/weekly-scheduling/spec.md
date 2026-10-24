# weekly-scheduling Specification

## Purpose

Representar horários fixos semanais e suas ocorrências em qualquer semana, preservando identidade e histórico durante mudanças de agenda.

## Requirements

### Requirement: Horário fixo com término opcional
O sistema SHALL permitir cadastrar uma aula semanal para um aluno, com início em dia útil e horário da grade e término opcional. Sem término, a série SHALL continuar nas semanas futuras sem exigir novos cadastros.

#### Scenario: Série sem término
- **WHEN** a professora cadastra toda terça às 10h sem data final e consulta uma semana distante
- **THEN** a ocorrência correspondente aparece uma vez, sem limite artificial de semanas.

#### Scenario: Série com término
- **WHEN** existe data de término
- **THEN** não são geradas ocorrências regulares depois dessa data.

### Requirement: Ocorrência com identidade estável
O sistema SHALL manter a identidade de cada aula de uma série, inclusive ao registrá-la ou remarcá-la. Horários fixos independentes do mesmo aluno SHALL permanecer independentes.

#### Scenario: Lançar uma ocorrência
- **WHEN** uma aula semanal ocorrida recebe um registro e a página é recarregada
- **THEN** ela aparece uma vez e mantém seu registro e horário histórico.

#### Scenario: Dois horários do mesmo aluno
- **WHEN** a professora cria séries independentes para terça e quinta
- **THEN** mudar a série de terça não altera a série de quinta.
