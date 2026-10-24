# Verificação do 1E — Livros e sequência principal

Implementado e verificado tecnicamente em 24/10/2026 na mudança `organize-material-library-1e`. Revisão de uso com Cristian e Nara pendente no 1F.

## Resultado

- Livros com um ou vários níveis, unidades com número único dentro do livro e materiais de apoio independentes com seus níveis.
- Uma sequência compartilhada entre os níveis do livro; um principal por aluno, com retomada do progresso ao trocar e voltar.
- Identificação do livro no planejamento/lançamento e filtro de unidades e apoios compatíveis no lançamento. Nível continua informativo.
- Progresso cronológico por aluno/livro, sem interferência de apoios ou troca de nível dentro de livro compartilhado.
- Conteúdo e nome do livro preservados em cópias históricas após edição do catálogo. Principal incompatível indicado até escolha explícita.
- Migração v1–v4 para v5 em memória, sem reset ou gravação na leitura. Preserva agenda, IDs, textos, planos, progresso e homework, inclusive sua correção.
- Homework permanece sem expansão de funcionalidades ou alteração de fluxo.

## Evidências

- **86 testes de domínio/persistência aprovados** em dez arquivos: oito novos para catálogo, numeração, compatibilidade, troca/retomada, promoção, histórico, integridade e migração. Cenários anteriores foram adaptados às regras de livro e ao formato v5.
- **31 cenários de navegador aprovados**, incluindo quatro novos de livros e as regressões de agenda, preparação, lançamento, homework, histórico, falhas e migrações.
- Após reforçar a migração de livros históricos quando o catálogo mudou de nível, os dois cenários de migração v3/v4 foram repetidos e aprovados.
- Build/TypeScript, formatação e OpenSpec estrito aprovados. Imagens de desktop e celular 390 × 844 conferidas; formulário móvel sem rolagem horizontal e conteúdo preservado na falha de armazenamento.
- Testes usam contextos isolados na porta 4177. Não foi reiniciado nem editado o armazenamento da prévia manual. Imagens e resultados ficam fora do Git.

## Para testar

1. Recarregar a prévia. Abrir **Acervo → Livros** e conferir a sequência do acervo anterior. Usar **Novo livro** para criar um livro com A1 e A2.
2. Em **Novo material**, escolher **Unidade de livro**, informar o livro e cadastrar unidades 1 e 2. Outra Unidade 1 nesse livro deve ser recusada; em outro livro, permitida.
3. Criar um **Material de apoio** com A1 e A2; conferir que aparece ao filtrar ambos os níveis, sem duplicação.
4. Em **Alunos → Editar**, escolher o livro principal. Lançar uma aula encerrada mantendo a unidade em andamento; concluir em outro encontro deve sugerir a próxima.
5. Trocar o principal, usar outro livro e voltar ao anterior. Conferir a retomada após recarga. Alterar A1 para A2 num livro compartilhado deve preservar a continuidade.
6. Renomear o livro e conferir que o histórico anterior mantém o nome e conteúdo registrados. Homework deve continuar com o mesmo funcionamento.

## Limites e publicação

Dados continuam somente no navegador, fictícios e sem contas reais/backend. O repositório público é [cristianworth/nextage-class](https://github.com/cristianworth/nextage-class); a aplicação não foi hospedada nesta entrega. Não houve inclusão de imagens locais, dados privados, credenciais ou dependências novas.

O [roadmap](roadmap.md) aponta o 1F como próximo passo: revisar uma semana fictícia com Nara antes da demo do aluno.
