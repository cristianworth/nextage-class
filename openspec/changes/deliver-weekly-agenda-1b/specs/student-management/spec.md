## ADDED Requirements

### Requirement: Indicação de obrigatoriedade
O sistema SHALL indicar campos obrigatórios do cadastro com asterisco vermelho e manter sua obrigatoriedade acessível, sem escrever “Opcional” nos demais campos.

#### Scenario: Abrir o cadastro
- **WHEN** a professora abre criação ou edição de aluno
- **THEN** os campos obrigatórios mostram asterisco vermelho, os demais não mostram “Opcional” e a validação do cadastro permanece ativa.
