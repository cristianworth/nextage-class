# Sequência e progresso do aluno

O refinamento do 1C introduziu continuidade pelo lançamento; o 1E passou a separar o progresso por aluno e livro. Uma unidade pode ocupar vários encontros da agenda. Ver [livros e unidades](book-catalog.md).

## Comportamento atual

- O aluno tem um livro principal compatível ou nenhum. Sem resultado anterior, o lançamento sugere a primeira unidade do livro; com progresso, retoma o ponto registrado.
- **Concluí esta unidade** começa desmarcada. Em andamento sugere a mesma unidade no próximo encontro; concluída sugere a próxima disponível do mesmo livro.
- Trabalhar e concluir Unidade 3 mantém Unidade 3 no histórico e indica Unidade 4 como continuidade. Não transforma o conteúdo daquele encontro na unidade seguinte.
- Faltas, apoio e lançamento sem material não apagam o progresso. Usar unidade de outro livro não altera o principal cadastrado; cada livro guarda seu próprio progresso.
- Trocar e voltar retoma o ponto anterior daquele livro. Mudar de A1 para A2 num livro que atende ambos mantém a continuidade, pois a sequência é compartilhada.
- O fim indica conclusão das unidades disponíveis, sem trocar nível ou livro automaticamente. Conteúdo posterior acrescentado pode estender a sequência.
- Livro incompatível ou unidade que saiu da sequência exige escolha explícita, sem apagar o histórico.

## Cronologia e histórico

O resultado pedagógico pertence ao registro. A consulta considera a data/hora efetiva do encontro, por aluno e livro. Editar encontro antigo não substitui o resultado de um posterior; consultar uma aula antiga considera apenas encontros anteriores.

A cópia histórica guarda conteúdo, nível do registro e identificação do livro, além de andamento/conclusão e continuidade. Correções de texto ou homework não alteram o resultado anterior; mudanças pedagógicas explícitas o atualizam. Renomear o livro não reescreve registros anteriores.

## Dados e verificação

Formato local v5, com migração validada v1–v4 em memória e gravação apenas na próxima alteração válida. A sequência antiga por nível vira um livro de acervo anterior. Não se presume conclusão de conteúdo antigo.

Ver [verification-1e.md](verification-1e.md) para evidências atuais. Os documentos de verificação 1A–1D registram as entregas anteriores; seus formatos e contagens são históricos. Revisão de uso com Cristian e Nara permanece no 1F.

## Para conferir

1. Em Acervo, criar um livro com níveis atendidos e cadastrar unidades numeradas pelo Novo material.
2. No aluno, selecionar esse livro como principal. Lançar um encontro sem concluir a unidade e conferir a sugestão seguinte.
3. Concluir essa unidade em outro encontro: o histórico deve manter a unidade trabalhada e indicar a próxima.
4. Trocar o principal, usar outra sequência e voltar ao primeiro livro. Conferir a retomada, inclusive após recarga.
5. Para testar conteúdo compartilhado, um livro A1/A2 deve continuar a mesma sequência após mudar o aluno entre esses níveis.
