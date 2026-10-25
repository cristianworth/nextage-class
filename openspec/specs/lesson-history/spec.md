# lesson-history Specification

## Purpose

Registrar e consultar o que aconteceu nas aulas já ocorridas, preservando o contexto pedagógico e permitindo corrigir o lançamento sem duplicá-lo.

## Requirements

### Requirement: Lançamento de aula ocorrida
O sistema SHALL permitir lançar presença, falta do aluno ou falta da professora apenas para uma aula cujo término já ocorreu no fuso de referência. Conteúdo SHALL ser obrigatório na presença; motivo de falta SHALL ser opcional.

#### Scenario: Aula futura
- **WHEN** a professora tenta lançar uma aula de dia futuro ou de hoje antes do término
- **THEN** o lançamento é recusado e a aula permanece sem registro.

#### Scenario: Presença registrada
- **WHEN** uma aula encerrada recebe presença, nível válido e conteúdo
- **THEN** o histórico inclui data, horário, aluno, nível, material utilizado e conteúdo informado.

#### Scenario: Falta sem justificativa
- **WHEN** uma aula encerrada recebe falta sem motivo
- **THEN** o lançamento é aceito sem gerar reposição ou crédito.

### Requirement: Registro único editável
O sistema SHALL manter no máximo um registro por aula, permitir sua edição e mostrar a última atualização preservando a data original de criação.

#### Scenario: Corrigir conteúdo
- **WHEN** a professora edita o conteúdo de uma aula lançada
- **THEN** o mesmo registro é atualizado, sem duplicar a aula no histórico.

### Requirement: Contexto histórico
O sistema SHALL preservar nome do aluno, nível e material em texto do lançamento independentemente de alterações posteriores no cadastro. A edição explícita do lançamento SHALL permitir corrigir os dados pedagógicos.

#### Scenario: Cadastro alterado
- **WHEN** nome ou nível do cadastro é alterado depois de um lançamento
- **THEN** o lançamento continua exibindo o contexto salvo para aquela aula.

### Requirement: Consulta e filtro
O sistema SHALL listar os registros por data decrescente e permitir filtrar por aluno e pesquisar conteúdo, com indicação clara de ausência de resultados.

#### Scenario: Histórico de um aluno
- **WHEN** a professora seleciona um aluno no filtro
- **THEN** são exibidos apenas os registros vinculados a ele, com ações de consulta e edição.

### Requirement: Material utilizado do acervo
O sistema SHALL permitir selecionar material do acervo ao lançar uma aula, mantendo também o texto livre anterior. A seleção SHALL guardar título, nível e conteúdo da versão utilizada. Editar outros campos do lançamento SHALL preservar essa cópia até troca explícita de material.

#### Scenario: Acervo alterado depois da aula
- **WHEN** o conteúdo do material muda depois do lançamento
- **THEN** o histórico continua exibindo a versão que foi efetivamente registrada, inclusive após editar outro campo do lançamento e recarregar.

#### Scenario: Material planejado diferente do utilizado
- **WHEN** a professora escolhe outro material no lançamento
- **THEN** o histórico guarda o material utilizado, sem substituir silenciosamente o planejamento.

### Requirement: Conteúdo trabalhado e continuidade distintos
O sistema SHALL guardar a aula do material trabalhada, sua situação em andamento/concluída e a continuidade indicada naquele lançamento como informações distintas. Edição de texto, homework ou acervo SHALL preservar esse resultado até alteração explícita.

#### Scenario: Preservar trabalho realizado
- **WHEN** um encontro conclui a Aula 3 e indica continuar na Aula 4
- **THEN** o histórico mostra Aula 3 como trabalhada, concluída, e Aula 4 como continuidade, inclusive após recarregar.

### Requirement: Nível informativo no lançamento
O sistema SHALL exibir o nível como informação sem seleção no lançamento. Novos registros SHALL usar o nível do cadastro do aluno; edição SHALL preservar o nível original do registro. Lançar aula SHALL nunca alterar o nível do aluno.

#### Scenario: Cadastro muda depois do lançamento
- **WHEN** um aluno A1 passa para A2 e um registro A1 é editado
- **THEN** o registro continua A1, o cadastro permanece A2 e o formulário não oferece alteração de nível.

### Requirement: Seleção única de livro ou material
O sistema SHALL oferecer um seletor de unidades e apoios compatíveis com o nível do registro, incluindo identificação do livro e opção sem material, sem novo texto livre. Novas seleções incompatíveis SHALL ser recusadas; cópia ou texto histórico SHALL poder ser mantidos fora do catálogo filtrado.

#### Scenario: Filtrar e preservar histórico
- **WHEN** uma aula A1 é lançada
- **THEN** são oferecidos apoios A1 e unidades de livros que atendem A1, sem impedir manter uma versão histórica em edição.

#### Scenario: Registro sem material
- **WHEN** a professora seleciona sem material e informa conteúdo válido
- **THEN** o registro é salvo sem exigir acervo nem alterar o progresso anterior.

### Requirement: Livro histórico
O sistema SHALL guardar identificação do livro junto da cópia da unidade e da continuidade utilizada. Alterar o catálogo ou o principal do aluno SHALL preservar o livro e conteúdo exibidos nos registros anteriores.

#### Scenario: Renomear livro
- **WHEN** um livro é renomeado depois de um lançamento
- **THEN** o registro anterior mantém a identificação e conteúdo registrados, inclusive após edição apenas de texto e recarga.

### Requirement: Categorias de conteúdo no lançamento
O sistema SHALL identificar o campo como conteúdo utilizado e agrupar unidades pela sequência e apoios em categoria própria. SHALL manter seleção única, filtro por nível, opção sem material e preservação de conteúdo histórico.

#### Scenario: Usar apoio avulso
- **WHEN** a professora escolhe um material compatível no grupo Materiais de apoio
- **THEN** o conteúdo é salvo no registro sem exigir uma unidade ou alterar a continuidade da sequência principal.
