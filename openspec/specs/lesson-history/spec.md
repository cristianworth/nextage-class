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
