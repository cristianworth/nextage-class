## ADDED Requirements

### Requirement: Progresso junto da preparação
O sistema SHALL mostrar a aula do material atual ou o fim da sequência nos detalhes do encontro e na lista de alunos. Planejamento opcional do encontro SHALL continuar separado e não substituir automaticamente a retomada do aluno no lançamento.

#### Scenario: Plano diferente da retomada
- **WHEN** a professora planeja material complementar, mas o aluno continua na Aula 3
- **THEN** o lançamento sugere a Aula 3 e permite escolher o complementar sem avançar a sequência.
