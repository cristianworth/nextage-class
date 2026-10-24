## MODIFIED Requirements

### Requirement: Seleção única de livro ou material
O sistema SHALL oferecer um seletor de unidades e apoios compatíveis com o nível do registro, incluindo identificação do livro e opção sem material, sem novo texto livre. Novas seleções incompatíveis SHALL ser recusadas; cópia ou texto histórico SHALL poder ser mantidos fora do catálogo filtrado.

#### Scenario: Filtrar e preservar histórico
- **WHEN** uma aula A1 é lançada
- **THEN** são oferecidos apoios A1 e unidades de livros que atendem A1, sem impedir manter uma versão histórica em edição.

#### Scenario: Registro sem material
- **WHEN** a professora seleciona sem material e informa conteúdo válido
- **THEN** o registro é salvo sem exigir acervo nem alterar o progresso anterior.

## ADDED Requirements

### Requirement: Livro histórico
O sistema SHALL guardar identificação do livro junto da cópia da unidade e da continuidade utilizada. Alterar o catálogo ou o principal do aluno SHALL preservar o livro e conteúdo exibidos nos registros anteriores.

#### Scenario: Renomear livro
- **WHEN** um livro é renomeado depois de um lançamento
- **THEN** o registro anterior mantém a identificação e conteúdo registrados, inclusive após edição apenas de texto e recarga.
