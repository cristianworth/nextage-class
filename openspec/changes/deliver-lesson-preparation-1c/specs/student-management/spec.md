## ADDED Requirements

### Requirement: Link manual da aula
O sistema SHALL permitir informar um link HTTP ou HTTPS sem credenciais no cadastro do aluno e abri-lo pelos detalhes de suas aulas em outra aba. Campo vazio SHALL continuar permitido. Outros esquemas SHALL ser recusados.

#### Scenario: Informar link
- **WHEN** um link válido é salvo no cadastro
- **THEN** as aulas desse aluno oferecem acesso ao link após recarregar, sem geração automática ou solicitação a serviço externo.
