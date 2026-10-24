# Verificação do 1D — Lançamento simples

Implementado e verificado tecnicamente em 24/10/2026 na mudança `simplify-lesson-entry-1d`. A revisão de uso com Cristian e Nara continua pendente.

## Resultado

- Nível visível sem edição: novos registros usam o cadastro; editar um registro antigo preserva seu nível original, sem alterar o aluno.
- Um seletor **Livro/material**, filtrado pelo nível do registro, com opção **Sem livro/material**. Novas seleções incompatíveis são recusadas também no domínio.
- Cópias históricas e textos livres antigos podem ser mantidos, mesmo após mudança de nível do aluno ou do item no acervo. Selecionar a versão atual do catálogo é uma ação explícita.
- Unidades exibidas como **Unidade N — Descrição**, ordenadas pelo número; materiais sem número continuam complementares.
- **Acervo → Adicionar exemplos** acrescenta somente exemplos ausentes. Preserva materiais existentes, alunos, agenda e registros; repetir não duplica. Falha ao gravar mantém os dados anteriores e permite tentar novamente.
- Homework permanece com a mesma descrição e correção inteira, sem nova funcionalidade ou mudança em seu fluxo.

## Evidências técnicas

- 78 testes de domínio/persistência aprovados em nove arquivos, incluindo sete novos para nível, compatibilidade, histórico, ordem numérica e exemplos sem reset.
- 27 cenários de navegador aprovados. Os quatro novos do 1D foram repetidos após reforçar o cenário que muda o nível do aluno e do material no catálogo; a última execução ficou aprovada.
- Cobertos lançamento sem acervo, texto histórico, recarga, falha de armazenamento, repetição de exemplos e tela móvel de 390 × 844 sem rolagem horizontal no formulário.
- Build/TypeScript, formatação e validação OpenSpec estrita aprovados. Imagens locais de computador/celular foram conferidas; resultados e imagens ficam fora do histórico Git.

## Para conferir na demo

1. Recarregar `http://127.0.0.1:5173`. Se o acervo estiver vazio, usar **Adicionar exemplos**, sem reiniciar a demo.
2. Abrir uma aula já encerrada e escolher **Lançar aula**. Conferir nível informativo e apenas materiais do nível correspondente.
3. Selecionar uma unidade e manter ou marcar **Concluí esta unidade**. O conteúdo trabalhado pertence à unidade selecionada, enquanto a continuidade indica o próximo encontro. Homework continua disponível abaixo.
4. Salvar e recarregar. Conferir material, conteúdo e nível no histórico. Editar um registro antigo após mudar o nível do aluno deve preservar o nível e a cópia anteriores.
5. Experimentar **Sem livro/material** com conteúdo válido; o lançamento deve funcionar sem apagar o progresso anterior.

## Limites e próximo recorte

Formato local continua v4, sem migração adicional ou reset. Testes usam contextos isolados e não alteram o armazenamento da prévia manual. Ainda não há backend, contas reais ou sincronização.

O catálogo atual associa cada item a um nível e numera unidades dentro dele. O **1E**, ainda não implementado, separará livro/material, unidades e apoio, com uma sequência principal por aluno e definição de compatibilidade com vários níveis. As perguntas sobre troca/retomada da sequência e unidades compartilhadas estão em [deferred-questions.md](deferred-questions.md). O roadmap está em [roadmap.md](roadmap.md).
