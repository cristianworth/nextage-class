# Verificação da entrega 1C

Data: 24/10/2026. Implementação e verificação técnica concluídas; revisão de uso com Cristian e Nara pendente. Mudança OpenSpec: `deliver-lesson-preparation-1c`.

## Entregue

- Acervo com título, nível A1–C2 e conteúdo em texto; criação, edição, leitura, pesquisa e filtro. Demo nova tem seis exemplos fictícios próprios.
- Preparação por ocorrência com material e anotação, último conteúdo do mesmo aluno e homework anterior pendente. O plano acompanha remarcação individual ou da série.
- Lançamento com material do acervo ou texto livre. A cópia do material utilizado permanece no histórico mesmo após editar o acervo ou outro campo do registro.
- Uma descrição de homework por aula, correção inteira com data e possibilidade de desfazer. Nova descrição volta a pendente; outros ajustes preservam a correção.
- Link manual HTTP/HTTPS no cadastro do aluno, disponível nos detalhes da aula.
- Formato local v3 com migração de v1/v2 em memória, preservando os dados anteriores sem exigir reset. Na migração o novo acervo começa vazio.

## Evidências técnicas

- 62 testes de domínio/persistência aprovados, incluindo 13 novos cenários para acervo, cópia histórica, homework, contexto cronológico, remarcação com plano, término/conflitos, link e migração do 1B.
- 19 cenários de navegador aprovados em Microsoft Edge via Playwright: 13 regressões do 1A/1B e seis novos fluxos do 1C.
- Fluxo integrado conferido: cadastrar material → registrar conteúdo/homework → preparar próxima aula → corrigir homework → lançar com material planejado → editar acervo → editar outro campo do lançamento → recarregar e reencontrar a versão histórica.
- Conferidos estados vazios, falha de gravação sem perda do formulário, texto renderizado literalmente, link manual validado e interface móvel sem ultrapassar a largura disponível.
- Build/TypeScript, formatação e OpenSpec estrito aprovados. O aviso informativo de requisito já existente ao arquivar mudanças antigas decorre da sincronização prévia da base; a revisão de uso continua pendente.
- Imagens locais de agenda, acervo, histórico e preparação conferidas. Resultados e imagens ficam ignorados no Git em `work/`/`test-results/`.

## Roteiro para revisar com Nara

1. Recarregue a demo sem reiniciar. Abra **Acervo** e cadastre um texto com título e nível. Pesquise e filtre para encontrá-lo. Se a demo veio do 1B, o acervo estará vazio até esse cadastro.
2. Abra uma aula futura e escolha **Preparar aula**. Selecione o material e escreva o que pretende retomar. Volte aos detalhes e leia o último conteúdo e as pendências.
3. Remarque essa ocorrência. O plano deve acompanhar a mesma aula, sem ser copiado para as outras semanas.
4. Em uma aula já encerrada, lance conteúdo, material utilizado e **Homework passado**. O material planejado é uma sugestão; pode escolher outro no lançamento.
5. Consulte a aula seguinte: o homework aparece como pendente. Marque como corrigido e confira no histórico. Use **Marcar como pendente** para desfazer.
6. Edite o material no acervo. No histórico, expanda **Conteúdo do material utilizado**: a versão da aula deve permanecer. Ao editar o lançamento, **Manter versão registrada** conserva essa cópia; escolher o material novamente usa a versão atual.
7. Salve um **Link da aula** no cadastro do aluno e confira sua disponibilidade nos detalhes. Teste também leitura e preparação no celular.
8. Recarregue e reencontre alterações, agenda e histórico. Anote o que difere da rotina real antes de planejar a próxima fase.

## Limites e escolhas revisáveis

- Demo local e fictícia, sem contas, backend, sincronização entre abas/dispositivos ou publicação. Arquivos, áudio e submissão de homework não fazem parte deste recorte.
- Acervo simples em texto, sem hierarquia de livro/módulo/unidade ou exclusão. Planejamento por ocorrência foi adotado como escolha revisável enquanto não houve resposta específica às consultas de preferência.
- Homework tem uma descrição e correção inteira, conforme confirmação de Cristian. Limpar a descrição retira a tarefa; mudar seu texto reinicia a correção.
- A preparação pode ser editada antes ou durante uma aula ainda não encerrada e sem registro. Material planejado continua mostrando a versão atual do acervo; apenas o utilizado recebe cópia histórica.
- Alterar a série é recusado integralmente se deixaria uma ocorrência planejada fora do término. Aulas iniciadas e registros continuam protegidos.
- Testes técnicos não representam aceitação da rotina pela professora. Próximo passo: revisão integrada e ajustes; demo do aluno permanece na fase 2.
