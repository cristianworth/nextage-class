# material-library Specification

## Purpose

Manter um acervo simples de textos por nível para consulta, planejamento e uso nas aulas individuais da professora.

## Requirements

### Requirement: Manter materiais em texto
O sistema SHALL criar e editar unidades de livro com número, título e conteúdo, ou textos de apoio com título, conteúdo e um ou vários níveis A1–C2. Criação SHALL ser preservada e atualização indicada. Exemplos SHALL ser fictícios e próprios.

#### Scenario: Criar e editar
- **WHEN** um material válido é salvo e depois editado
- **THEN** o acervo mostra a versão atual sem duplicar o material e mantém a data de criação.

### Requirement: Consultar acervo
O sistema SHALL permitir pesquisar título/conteúdo, filtrar por nível e ler o texto completo, com estados vazios claros e sem interpretar o conteúdo como HTML.

#### Scenario: Buscar por nível
- **WHEN** a professora filtra A2 e pesquisa um termo
- **THEN** somente materiais correspondentes aparecem, ou uma indicação de ausência de resultados.

### Requirement: Ordem das aulas do material
O sistema SHALL ordenar unidades numericamente dentro do livro e recusar número duplicado no mesmo livro. Livros diferentes SHALL aceitar o mesmo número. Apoios SHALL permanecer independentes da sequência. Alterações SHALL preservar cópias históricas.

#### Scenario: Organizar sequência
- **WHEN** o Livro A contém Unidade 2 e Unidade 10
- **THEN** a Unidade 2 aparece antes da 10; outra Unidade 2 nesse livro é recusada, mas Unidade 2 no Livro B é permitida.

### Requirement: Identificação de unidades
O sistema SHALL exibir unidades numeradas como Unidade N — Descrição e manter a ordenação numérica independente do título. Materiais sem número SHALL continuar complementares; nomes e textos históricos livres SHALL ser preservados.

#### Scenario: Ordem numérica
- **WHEN** o seletor oferece unidades 2 e 10
- **THEN** Unidade 2 aparece antes de Unidade 10, ainda que a ordem alfabética das descrições seja diferente.

### Requirement: Consultar livros e apoios
O sistema SHALL permitir consultar livros, abrir suas unidades e filtrar materiais pela compatibilidade com o nível. A identificação no planejamento e lançamento SHALL distinguir unidades de livros diferentes e apoios.

#### Scenario: Unidades com mesmo número
- **WHEN** dois livros compatíveis têm Unidade 1
- **THEN** as opções exibem o livro e Unidade 1 — Descrição, sem ambiguidade.
