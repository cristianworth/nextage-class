# Design

## Context

A demo v4 contém materiais planos com nível único e numeração única por nível. Registros guardam cópias e continuidade cronológica, não um cursor mutável. A gravação existente valida e persiste antes de atualizar a interface.

## Goals / Non-Goals

**Goals:** livros com sequência compartilhada entre níveis, apoios, principal por aluno, progresso retomável e migração segura.

**Non-Goals:** tarefas novas, arquivos, editor rico, exclusão, portal, autenticação ou servidor.

## Decisions

- Adicionar coleção de livros com título e níveis; unidades referenciam livro e número. Apoios têm níveis próprios e não têm número/livro. Número único dentro do livro, permitindo o mesmo número em outros livros.
- Compatibilidade de unidade vem do livro; apoio aceita um ou vários níveis. Manter o campo de nível legado como representação compatível, com helpers públicos que centralizam a compatibilidade. A UI não pede níveis individuais para unidades.
- Aluno tem principal opcional. Remover/trocar principal não apaga registros; voltar retoma o último resultado daquele livro. Livro incompatível após promoção fica indicado até seleção explícita, sem apagar o vínculo.
- Progresso continua derivado da cronologia dos encontros, agora por aluno/livro. A troca de nível não reinicia um livro compartilhado. Apoio não interfere. Unidade de outro livro pode ser registrada, sem alterar a sequência principal atual.
- Cópias históricas incluem identificação do livro no lançamento. Editar livro, unidade, cadastro ou homework não reescreve o passado. Manter versão histórica não depende do catálogo atual.
- Formato v5; validar v1–v4 antes de migrar em memória. Unidades antigas agrupadas em um livro por nível; associar principal desse nível aos alunos existentes, sem inventar conclusão. Preservar IDs, textos, conteúdo, planos e homework. Gravar apenas em alteração válida.
- Acervo terá abas Livros e Materiais, formulário de livro, cadastro de unidade/apoio e acesso às unidades pelo livro. Cadastro do aluno seleciona o principal compatível. Lançamento mantém seleção única com identificação do livro; preparação usa a mesma identificação.

## Risks / Trade-offs

- Metadados legados coexistem com livros para preservar contratos históricos. Helpers e validação centralizam decisões para evitar filtros divergentes.
- Mudança de níveis de um livro pode torná-lo incompatível com um aluno: sinalizar, preservar dados e recusar novas seleções incompatíveis, sem desvinculação silenciosa.
- Migração não pode adivinhar livros reais: nomes explícitos de acervo anterior e edição posterior. Exemplos usam apenas textos fictícios.
