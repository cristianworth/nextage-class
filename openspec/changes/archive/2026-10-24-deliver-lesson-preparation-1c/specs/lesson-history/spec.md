## ADDED Requirements

### Requirement: Material utilizado do acervo
O sistema SHALL permitir selecionar material do acervo ao lançar uma aula, mantendo também o texto livre anterior. A seleção SHALL guardar título, nível e conteúdo da versão utilizada. Editar outros campos do lançamento SHALL preservar essa cópia até troca explícita de material.

#### Scenario: Acervo alterado depois da aula
- **WHEN** o conteúdo do material muda depois do lançamento
- **THEN** o histórico continua exibindo a versão que foi efetivamente registrada, inclusive após editar outro campo do lançamento e recarregar.

#### Scenario: Material planejado diferente do utilizado
- **WHEN** a professora escolhe outro material no lançamento
- **THEN** o histórico guarda o material utilizado, sem substituir silenciosamente o planejamento.
