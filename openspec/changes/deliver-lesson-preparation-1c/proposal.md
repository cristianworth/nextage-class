# Proposal

## Why

O 1B organiza os horários, mas a professora ainda precisa reunir conteúdo anterior, homework e material antes da aula. O 1C fecha a demo do professor com preparação e acompanhamento pedagógico simples, preservando o histórico.

## What Changes

- Cadastrar, editar, pesquisar e filtrar materiais em texto por nível; exemplos fictícios próprios.
- Planejar material para uma ocorrência de aula e consultar o último conteúdo do aluno.
- Selecionar material efetivamente utilizado no lançamento e guardar uma cópia histórica de título, nível e conteúdo.
- Registrar uma descrição de homework por aula e marcar/desmarcar a correção inteira; exibir pendências antes da próxima aula.
- Cadastrar link manual de reunião no aluno e abri-lo pelos detalhes da aula.
- Preservar dados locais do 1A/1B ao acrescentar as novas informações e conferir o fluxo no celular.

## Capabilities

### New Capabilities

- `material-library`: acervo em texto, pesquisa, filtro e edição.
- `homework-tracking`: homework por aula e marcação de correção.
- `lesson-preparation`: material planejado por ocorrência e contexto para começar a aula.

### Modified Capabilities

- `lesson-history`: material do acervo com contexto histórico preservado.
- `student-management`: link de reunião manual.
- `demo-workspace`: navegação para acervo e compatibilidade dos dados anteriores.

## Impact

Modelos locais, persistência, operações de domínio, navegação, detalhes da aula, lançamento/histórico e cadastro. Sem novas dependências, backend, portal do aluno, uploads, recursos de IA ou integração Google.

Cristian confirmou descrição única e correção inteira para homework. Até resposta diferente, adotar título/nível/conteúdo e planejamento por ocorrência como escolhas simples e revisáveis; não tratá-las como validação da professora. O pedido atual autoriza documentação e implementação do 1C.
