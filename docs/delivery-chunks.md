# Blocos de entrega

Atualizado em 24/10/2026. A assistência implementa e verifica; Cristian guia as decisões e revisa com Nara. Este documento fraciona a etapa 1; fases posteriores estão no [roadmap](roadmap.md).

## Entregas técnicas existentes

| Incremento | Blocos concluídos | Evidência |
| --- | --- | --- |
| 1A — Primeiro ciclo | Fundação, dados locais, alunos, aula pontual, registro, histórico | [verification-1a.md](verification-1a.md) |
| 1B — Agenda da rotina | Regras, recorrência, bloqueios, remarcação individual/da série e revisão técnica | [verification-1b.md](verification-1b.md) |
| 1C — Preparação | Acervo em texto, material utilizado com cópia, homework, preparação, link manual e revisão técnica | [verification-1c.md](verification-1c.md) |
| Refinamento do 1C | Numeração, progresso por aluno e conclusão no lançamento, sem reescrever o passado | [course-progress.md](course-progress.md) |

Essas entregas continuam sujeitas à revisão de uso. Homework fica estabilizado no comportamento atual, sem novos blocos de desenvolvimento.

## 1D — Lançamento simples e consistente

Implementado e verificado tecnicamente na mudança `simplify-lesson-entry-1d`. Os quatro blocos abaixo estão concluídos; revisão de uso pendente. Ver [verification-1d.md](verification-1d.md).

| Bloco | Resultado | Conferência |
| --- | --- | --- |
| D1 — Planejamento | Roadmap revisto e distinção entre sequência principal e apoio | Documentos sem antecipar livros/portal como prontos |
| D2 — Nível e compatibilidade | Nível determinado pelo cadastro em novos registros e preservado na edição; rejeitar novas seleções incompatíveis | Testar tentativa de override, promoção de nível e histórico antigo |
| D3 — Interface e exemplos | Seleção única, filtrada; Unidade N; exemplos sem reset | Testar ordem 2/10, vazio, histórico, idempotência e falha ao salvar |
| D4 — Revisão integrada | Conferir progressão, homework inalterado, recarga e celular | Regressões, build, OpenSpec e roteiro de revisão |

## 1E — Organização do acervo

Implementado e verificado tecnicamente em `organize-material-library-1e`. E1–E4 concluídos, com uma sequência compartilhada entre níveis e retomada ao voltar ao livro. Ver [verification-1e.md](verification-1e.md). Revisão de uso pendente.

| Bloco | Resultado entregue | Decisão incorporada |
| --- | --- | --- |
| E1 — Modelo de livro/material | Separar livro, unidades numeradas e apoio; permitir números repetidos em livros diferentes | Uma sequência única de unidades por livro, compartilhada entre seus níveis |
| E2 — Sequência principal | Um livro/sequência principal por aluno, com apoio independente | Trocar e voltar retoma o progresso daquele livro |
| E3 — Compatibilidade e catálogo | Associar um ou vários níveis; filtrar sem duplicar conteúdo | Níveis herdados do livro para unidades; níveis próprios para apoio; migração v1–v4 sem reset |
| E4 — Cadastro e revisão | Gerenciar essa organização em texto e selecionar no lançamento | Exemplos fictícios, cópias históricas e nome do livro preservados após edição |

Não incluir uploads, áudio, editor rico ou recursos extras de homework por conveniência.

## 1F — Revisão com a professora

| Bloco | Resultado esperado | Evidência |
| --- | --- | --- |
| F1 — Semana fictícia | Percorrer o fluxo do professor com unidade longa e materiais de apoio | Nara identifica diferenças de sua rotina |
| F2 — Ajustes e consolidação | Corrigir o que impede o fluxo e registrar decisões | Requisitos entregues coerentes e pendências explícitas antes da etapa 2 |

A revisão humana não é marcada como feita por uma execução de testes.
