# student-management Specification

## Purpose

Manter os alunos fictícios que participam das aulas individuais, com cadastro simples, pesquisa e edição sem reescrever seu histórico.

## Requirements

### Requirement: Cadastro mínimo
O sistema SHALL exigir nome não vazio e nível entre A1, A2, B1, B2, C1 e C2. Telefone, ocupação e interesses SHALL ser opcionais. Data de cadastro e início das aulas SHALL ser informações distintas.

#### Scenario: Salvar apenas dados obrigatórios
- **WHEN** a professora fornece nome e nível válidos
- **THEN** o aluno é cadastrado mesmo sem dados complementares, com a data de cadastro gerada e início das aulas informado ou preenchido com hoje.

#### Scenario: Nome vazio
- **WHEN** o nome contém apenas espaços
- **THEN** o cadastro é recusado e o motivo é apresentado sem perder o formulário.

### Requirement: Pesquisa e edição
O sistema SHALL permitir pesquisar alunos por nome e editar seu cadastro sem modificar aulas ou valores já registrados no histórico.

#### Scenario: Encontrar um aluno
- **WHEN** a professora pesquisa parte de um nome
- **THEN** a lista apresenta os alunos correspondentes e um estado vazio quando não há resultados.

#### Scenario: Alterar nível após uma aula
- **WHEN** o nível do aluno muda depois de um lançamento
- **THEN** o cadastro mostra o novo nível e o registro anterior mantém o nível lançado.

### Requirement: Indicação de obrigatoriedade
O sistema SHALL indicar campos obrigatórios do cadastro com asterisco vermelho e manter sua obrigatoriedade acessível, sem escrever “Opcional” nos demais campos.

#### Scenario: Abrir o cadastro
- **WHEN** a professora abre criação ou edição de aluno
- **THEN** os campos obrigatórios mostram asterisco vermelho, os demais não mostram “Opcional” e a validação do cadastro permanece ativa.
