# Livros, unidades e sequência principal — 1E

Implementação técnica em 24/10/2026. Uma sequência principal por aluno e materiais de apoio, conforme DEC-41. A revisão de rotina com Nara pertence ao 1F.

## Como organizar

- **Livro/sequência:** título e um ou vários níveis atendidos. Um livro A1/A2 tem uma única sequência compartilhada, sem duplicar unidades por nível.
- **Unidade:** pertence a um livro; tem número positivo, descrição e conteúdo em texto. Unidade 2 vem antes da 10. Livros diferentes podem ter Unidade 1, mas um livro não pode repetir esse número.
- **Apoio:** texto independente com um ou vários níveis; não tem número nem avança a sequência principal.
- **Principal do aluno:** um livro compatível ou nenhum. Trocar e voltar retoma o progresso de cada livro. Alterar o nível do aluno não reinicia um livro que também atende o novo nível.

Acervo permite alternar **Materiais** e **Livros**, pesquisar, filtrar por nível, editar livros e abrir suas unidades. Em **Novo material**, escolher **Unidade de livro** ou **Material de apoio**. Unidade herda os níveis do livro; apoio informa seus próprios níveis.

## Lançamento e continuidade

O nível continua informativo. O seletor único identifica livro e **Unidade N — Descrição**, além dos apoios compatíveis e da opção sem material. A sequência principal sugere o conteúdo atual; a professora informa o que trabalhou e se concluiu.

O progresso vem dos registros, ordenados pela data/hora do encontro e separado por aluno e livro. Apoio não altera esse progresso. Registrar uma unidade de outro livro não troca o principal do cadastro; esse outro livro mantém seu próprio histórico. O fim não troca livro nem nível automaticamente.

Se o livro deixar de atender o nível do aluno, o cadastro mantém o vínculo indicado como incompatível até escolha explícita. Suas unidades não são sugeridas para novos lançamentos desse nível. A versão antiga permanece disponível ao editar registros históricos.

O registro guarda título, livro, nível e conteúdo utilizados, além da continuidade indicada. Renomear o livro ou alterar o catálogo não reescreve essa cópia. Homework mantém o mesmo formato e funcionamento.

## Compatibilidade dos dados

Formato local **v5**, mantendo a chave `nextage-class:workspace:v1`. Dados válidos v1–v4 são validados e migrados em memória; a leitura não grava. Somente uma alteração válida persiste a nova versão.

As unidades numeradas antigas formam **Sequência A1 (acervo anterior)**, por exemplo, e alunos desse nível recebem essa sequência principal. Os títulos podem ser editados para os livros reais pretendidos. Materiais sem número permanecem apoios; dados antigos sem sequência não ganham conclusão ou livro presumidos. IDs, conteúdo, textos históricos, planejamento, agenda e homework são preservados. Dados inválidos/versões desconhecidas continuam protegidos contra sobrescrita automática.

O campo interno de nível único é mantido por compatibilidade com os contratos anteriores. O filtro atual usa os níveis do livro ou do apoio, centralizados nas funções do catálogo; unidades não têm configuração independente de níveis.

## Limites

Sem exclusão, uploads, editor rico, autenticação ou backend. Não há divisão de unidades por nível dentro de um mesmo livro. O próximo passo é a revisão de uma semana fictícia com Nara no 1F, antes do portal do aluno.
