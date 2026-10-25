# student-overview Specification

## Purpose

Permitir experimentar a consulta do aluno às próprias aulas, material utilizado e homework, preservando os campos reservados à professora na demo.

## Requirements

### Requirement: Entrada simulada do aluno
O sistema SHALL permitir abrir a simulação do aluno e retornar à professora. Ferramentas da demo SHALL identificar a seleção de aluno como simulação com dados fictícios. Entrar, trocar perfil, navegar e retornar SHALL não gravar ou alterar dados locais.

#### Scenario: Alternar perfis sem alteração
- **WHEN** a pessoa abre a prévia, troca o aluno e retorna à professora
- **THEN** a consulta acompanha o aluno escolhido e os dados de agenda, registros e homework permanecem iguais.

### Requirement: Próximas aulas próprias
A consulta SHALL exibir até seis próximas aulas do aluno selecionado, incluindo ocorrências semanais e remarcadas, em ordem efetiva e no fuso de Brasília. SHALL oferecer somente o link manual daquele aluno e informar ausência de aulas ou alunos.

#### Scenario: Ocorrência remarcada
- **WHEN** a professora altera uma aula semanal do aluno
- **THEN** a consulta mostra a data/hora vigente sem duplicar a ocorrência nem listar nomes, links ou detalhes de outros alunos.

### Requirement: Histórico compartilhado em leitura
A consulta SHALL mostrar registros próprios por data/hora decrescente, com situação, nível histórico, material utilizado e homework pendente/corrigido. Cópias históricas SHALL ser preservadas. Não SHALL oferecer edição, correção de homework ou criação de aulas.

#### Scenario: Material alterado e tarefa corrigida
- **WHEN** o catálogo muda depois de um lançamento e a professora corrige seu homework
- **THEN** o aluno vê a versão do material registrada e a situação atual da tarefa, sem poder alterá-las.

### Requirement: Campos explícitos da consulta
O modelo entregue à tela do aluno SHALL excluir conteúdo/observações livres do lançamento, motivo de falta, planejamento, dados complementares do cadastro e dados de outros alunos. Seleção inexistente SHALL retornar estado vazio, sem usar outro aluno como substituto silencioso.

#### Scenario: Registro com anotações reservadas
- **WHEN** o registro tem texto livre, motivo de falta e plano da professora
- **THEN** esses campos não fazem parte do contrato nem da tela do aluno; material e homework permitidos continuam disponíveis.

#### Scenario: Aluno inexistente
- **WHEN** a seleção aponta para um aluno que não existe
- **THEN** a consulta informa ausência de dados sem expor outro aluno.
