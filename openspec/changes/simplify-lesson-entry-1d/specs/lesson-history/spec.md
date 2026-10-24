## ADDED Requirements

### Requirement: Nível informativo no lançamento
O sistema SHALL exibir o nível como informação sem seleção no lançamento. Novos registros SHALL usar o nível do cadastro do aluno; edição SHALL preservar o nível original do registro. Lançar aula SHALL nunca alterar o nível do aluno.

#### Scenario: Cadastro muda depois do lançamento
- **WHEN** um aluno A1 passa para A2 e um registro A1 é editado
- **THEN** o registro continua A1, o cadastro permanece A2 e o formulário não oferece alteração de nível.

### Requirement: Seleção única de livro ou material
O sistema SHALL oferecer um seletor Livro/material com itens compatíveis com o nível do registro e opção sem material, sem novo texto livre de livro/material. Novas seleções incompatíveis SHALL ser recusadas; cópia ou texto histórico SHALL poder ser mantidos mesmo fora do catálogo filtrado.

#### Scenario: Filtrar e preservar histórico
- **WHEN** uma aula A1 é lançada
- **THEN** só itens A1 são oferecidos no catálogo, sem impedir manter uma versão histórica em edição.

#### Scenario: Registro sem material
- **WHEN** a professora seleciona sem material e informa conteúdo válido
- **THEN** o registro é salvo sem exigir acervo nem alterar o progresso anterior.
