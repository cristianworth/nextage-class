# material-library Specification

## Purpose

Manter um acervo simples de textos por nível para consulta, planejamento e uso nas aulas individuais da professora.

## Requirements

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

### Requirement: Ordem das aulas do material
O sistema SHALL permitir informar um número inteiro positivo para ordenar aulas do material dentro do nível, impedindo números duplicados no mesmo nível. Material sem número SHALL continuar disponível como complementar. Ordenação SHALL ser numérica e alterações SHALL preservar cópias históricas.

#### Scenario: Organizar sequência
- **WHEN** o acervo contém A1 Aula 2 e Aula 10
- **THEN** a Aula 2 aparece antes da Aula 10; outra A1 Aula 2 é recusada, mas A2 Aula 2 é permitida.

### Requirement: Identificação de unidades
O sistema SHALL exibir unidades numeradas como Unidade N — Descrição e manter a ordenação numérica independente do título. Materiais sem número SHALL continuar complementares; nomes e textos históricos livres SHALL ser preservados.

#### Scenario: Ordem numérica
- **WHEN** o seletor oferece unidades 2 e 10
- **THEN** Unidade 2 aparece antes de Unidade 10, ainda que a ordem alfabética das descrições seja diferente.
