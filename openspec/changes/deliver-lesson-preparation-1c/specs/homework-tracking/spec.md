## Purpose

Registrar o homework passado em cada aula e sua correção completa, permitindo retomar tarefas pendentes antes do próximo encontro.

## ADDED Requirements

### Requirement: Descrição única por aula
O sistema SHALL permitir uma descrição de homework por registro de aula. Descrição vazia SHALL representar ausência de homework. Editar a descrição SHALL deixar a nova tarefa pendente; editar outros campos SHALL preservar sua correção.

#### Scenario: Passar homework
- **WHEN** a professora lança uma aula com a descrição de homework
- **THEN** a tarefa fica vinculada à mesma aula e aparece no histórico e na preparação de aulas posteriores daquele aluno.

### Requirement: Marcar correção inteira
O sistema SHALL permitir marcar e desmarcar a correção do homework inteiro e indicar a data de correção. Não SHALL haver submissão de arquivos ou correção parcial.

#### Scenario: Corrigir e desfazer
- **WHEN** uma tarefa pendente é marcada como corrigida e depois desmarcada
- **THEN** ela retorna às pendências sem duplicação, mantendo sua descrição e aula de origem.
