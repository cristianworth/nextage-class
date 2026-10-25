# Design

## Context

O formato v5 já suporta sequência numerada, título livre, seleção de qualquer unidade e apoios sem número. Na demo, A1 só possui unidades. O seletor não diferencia visualmente as categorias.

## Goals / Non-Goals

**Goals:** tornar a sequência autoral e os apoios descobríveis, verificar percurso flexível e fechar a documentação da etapa 1.

**Non-Goals:** exclusões individuais persistidas, objetivos/tags estruturados, vários conteúdos por encontro, percentual de conclusão, editor rico ou alteração de homework.

## Decisions

- Renomear a apresentação para sequência; exemplos explicam livro ou aulas próprias. Manter Book/bookId e dados v5 por compatibilidade, evitando migração sem mudança estrutural.
- Manter uma seleção de conteúdo por lançamento, agrupando unidades por sequência e apoios em grupo próprio. O filtro de nível permanece igual.
- Acrescentar apoio A1 próprio/fictício à demo e à ação existente de exemplos. Não carregar nem sobrescrever dados automaticamente.
- Preservar o progresso derivado do conteúdo efetivamente lançado. Escolher Unidade 3 não cria registro/conclusão da 2; selecionar a 2 depois retoma esse conteúdo. Não criar status “dispensada” nem progresso percentual.
- Atualizar README para apresentação de portfólio, registrar aceite relatado por Cristian e separar documentos atuais das evidências históricas. Consolidar e arquivar mudanças concluídas sem reaplicar deltas antigos.

## Risks / Trade-offs

- “Pular” pode significar omissão persistente por aluno: Cristian confirmou que escolha direta no lançamento atende agora. Esse recurso maior permanece proposto para evolução pedagógica.
- Nomes internos ainda usam book: documentar esse mapeamento, preservando compatibilidade e evitando uma refatoração ampla apenas por vocabulário.
