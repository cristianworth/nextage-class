# lesson-preparation Specification

## Purpose

Reunir horário, último conteúdo, homework e material planejado nos detalhes de uma ocorrência, para preparar e conduzir a aula.

## Requirements

### Requirement: Planejamento por ocorrência
O sistema SHALL permitir selecionar, trocar ou retirar um material planejado e uma anotação de preparação para uma aula ainda não encerrada e sem registro. Esse planejamento SHALL afetar apenas a ocorrência escolhida, sem declarar que o material foi utilizado.

#### Scenario: Planejar uma aula semanal
- **WHEN** um material é planejado para uma ocorrência de terça
- **THEN** outras ocorrências da série não recebem automaticamente esse planejamento.

### Requirement: Contexto anterior do aluno
O sistema SHALL exibir o conteúdo da última aula com presença anterior à ocorrência consultada e os homeworks pendentes anteriores do mesmo aluno, com indicação clara quando não houver dados.

#### Scenario: Consultar uma aula anterior
- **WHEN** uma ocorrência antiga é aberta
- **THEN** o conteúdo anterior não vem de uma aula posterior nem de outro aluno.

### Requirement: Preservar preparação na remarcação
O sistema SHALL manter o planejamento ligado à identidade da ocorrência ao remarcar individualmente ou alterar o futuro da série. Uma mudança que deixaria planejamento fora do término SHALL ser recusada integralmente.

#### Scenario: Mudar horário fixo
- **WHEN** uma série com ocorrência planejada muda de terça para quarta
- **THEN** o planejamento acompanha a mesma ocorrência na quarta e não permanece duplicado na terça.

### Requirement: Progresso junto da preparação
O sistema SHALL mostrar a aula do material atual ou o fim da sequência nos detalhes do encontro e na lista de alunos. Planejamento opcional do encontro SHALL continuar separado e não substituir automaticamente a retomada do aluno no lançamento.

#### Scenario: Plano diferente da retomada
- **WHEN** a professora planeja material complementar, mas o aluno continua na Aula 3
- **THEN** o lançamento sugere a Aula 3 e permite escolher o complementar sem avançar a sequência.
