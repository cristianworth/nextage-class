# book-catalog Specification

## Purpose

Organizar livros com suas próprias unidades e níveis atendidos, permitindo que cada aluno siga uma sequência principal com apoio independente.

## Requirements

### Requirement: Manter livros e compatibilidade
O sistema SHALL cadastrar e editar livros com título e um ou vários níveis A1–C2 obrigatórios, preservando criação e indicando atualização. Cada livro SHALL ter uma sequência única compartilhada entre seus níveis; suas unidades SHALL herdar essa compatibilidade.

#### Scenario: Livro compartilhado
- **WHEN** um livro atende A1 e A2 e contém Unidade 1
- **THEN** essa unidade é selecionável para alunos de ambos os níveis sem duplicar o conteúdo.

### Requirement: Sequência principal do aluno
O sistema SHALL permitir selecionar um livro principal compatível ou nenhum. Trocar ou remover o principal SHALL preservar os progressos e registros anteriores. Alteração de nível que torne o principal incompatível SHALL ser indicada sem apagá-lo automaticamente.

#### Scenario: Trocar e voltar
- **WHEN** o aluno sai do Livro A em andamento na Unidade 3, usa o Livro B e retorna ao A
- **THEN** a sugestão retoma a Unidade 3 do Livro A, sem usar o progresso do B.

#### Scenario: Principal incompatível
- **WHEN** o nível do aluno deixa de ser atendido por seu livro principal
- **THEN** o vínculo permanece indicado e novas unidades incompatíveis não são sugeridas.

### Requirement: Sequência didática autoral
O sistema SHALL apresentar o agrupamento numerado como sequência didática, utilizável para livro ou aulas autorais. Título, níveis, ordem e continuidade SHALL funcionar da mesma forma nas duas situações, preservando os dados existentes.

#### Scenario: Aulas criadas pela professora
- **WHEN** a professora cadastra uma sequência Speaking com Nara e suas unidades numeradas
- **THEN** pode escolhê-la como principal e utilizar suas unidades sem informar um livro comercial.
