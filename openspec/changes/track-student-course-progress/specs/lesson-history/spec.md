## ADDED Requirements

### Requirement: Conteúdo trabalhado e continuidade distintos
O sistema SHALL guardar a aula do material trabalhada, sua situação em andamento/concluída e a continuidade indicada naquele lançamento como informações distintas. Edição de texto, homework ou acervo SHALL preservar esse resultado até alteração explícita.

#### Scenario: Preservar trabalho realizado
- **WHEN** um encontro conclui a Aula 3 e indica continuar na Aula 4
- **THEN** o histórico mostra Aula 3 como trabalhada, concluída, e Aula 4 como continuidade, inclusive após recarregar.
