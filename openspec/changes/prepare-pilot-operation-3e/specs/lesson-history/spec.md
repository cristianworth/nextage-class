# Spec Delta

## ADDED Requirements

### Requirement: Histórico legível em telas pequenas
A interface do histórico do piloto SHALL manter texto de registros e materiais legível dentro da área disponível em computador e celular, inclusive palavras longas, preservando o conteúdo integral e as ações de consulta e edição.

#### Scenario: Descrição longa sem espaços
- **WHEN** um registro contém uma descrição longa ou palavra sem espaços e é aberto em tela de celular
- **THEN** o texto permanece legível sem ultrapassar a largura da página e sem alterar seu conteúdo salvo.