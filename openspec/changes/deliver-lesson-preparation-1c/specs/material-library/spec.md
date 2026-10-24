## Purpose

Manter um acervo simples de textos por nível para consulta, planejamento e uso nas aulas individuais da professora.

## ADDED Requirements

### Requirement: Manter materiais em texto
O sistema SHALL permitir criar e editar material com título, nível A1–C2 e conteúdo em texto obrigatórios, preservando criação e indicando atualização. Exemplos SHALL ser fictícios e próprios.

#### Scenario: Criar e editar
- **WHEN** um material válido é salvo e depois editado
- **THEN** o acervo mostra a versão atual sem duplicar o material e mantém a data de criação.

### Requirement: Consultar acervo
O sistema SHALL permitir pesquisar título/conteúdo, filtrar por nível e ler o texto completo, com estados vazios claros e sem interpretar o conteúdo como HTML.

#### Scenario: Buscar por nível
- **WHEN** a professora filtra A2 e pesquisa um termo
- **THEN** somente materiais correspondentes aparecem, ou uma indicação de ausência de resultados.
