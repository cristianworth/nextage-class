# Proposal

## Why

O 1D ordena unidades por nível, mas livros diferentes precisam de numeração e progresso independentes. O 1E organiza o acervo antes do portal do aluno, preservando a demo existente.

## What Changes

- Cadastrar livros/sequências com um ou vários níveis e unidades próprias; manter textos de apoio independentes.
- Escolher uma sequência principal por aluno. Trocar e voltar retoma o progresso anterior, conforme confirmado por Cristian.
- Uma sequência única por livro, compartilhada entre seus níveis; unidades seguem a compatibilidade do livro.
- Selecionar unidades e apoios compatíveis no lançamento, sem alterar homework. Apoios não avançam a sequência principal.
- Migrar dados locais sem reset e preservar versões históricas de conteúdo e identificação do livro.

## Capabilities

### New Capabilities

- `book-catalog`: livros, níveis atendidos, unidades e seleção principal por aluno.

### Modified Capabilities

- `material-library`: unidades ordenadas por livro e apoios compatíveis com vários níveis.
- `course-progress`: continuidade independente por aluno/livro e retomada após troca.
- `lesson-history`: referência histórica do livro e filtro por compatibilidade.
- `demo-workspace`: migração preservando acervo, progresso, agenda e homework.

## Impact

Domínio, persistência local v5, acervo, cadastro do aluno, preparação e lançamento React. Sem dependências novas, uploads, backend ou recursos adicionais de homework. Revisão técnica separada da revisão de uso 1F.
