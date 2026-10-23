# Verificação da entrega 1B

Data: 23/10/2026. Implementação e verificação técnica concluídas. Revisão de uso com Cristian e a professora pendente. Mudança OpenSpec: `deliver-weekly-agenda-1b`.

## Entregue

- Horário semanal com término opcional, consultável em qualquer semana, sem guardar uma lista infinita de aulas.
- Séries independentes para o mesmo aluno; aulas pontuais continuam disponíveis.
- Bloqueio pontual ou semanal de intervalos entre 07h e 23h. Feriados/férias são manuais.
- Remarcação com “somente esta aula” por padrão e “esta e as próximas” para séries. Alterar o futuro substitui trocas individuais futuras e preserva aulas iniciadas e registros.
- Conflito entre aulas, séries e bloqueios durante toda a validade; falha mantém a agenda anterior.
- Registro de ocorrência semanal com identidade estável e sem duplicação no histórico.
- Migração do formato local v1 para v2, mantendo alunos, aulas e registros, sem exigir reset.
- Cadastro sem “Opcional”, com asteriscos vermelhos nos campos obrigatórios e validação nativa preservada.

## Evidências técnicas

- 49 testes de domínio/persistência aprovados, incluindo regressões do 1A, migração, séries sem término, data final inclusiva, conflitos em semanas distantes, intervalos adjacentes, identidade, histórico e atomicidade.
- 13 cenários de navegador aprovados em Microsoft Edge via Playwright: oito regressões do 1A e cinco novos fluxos para remarcação completa, bloqueios/remoção, migração/recarga, cadastro e uso no celular.
- Build de produção e verificação de TypeScript aprovados; formatação conferida.
- Mudança OpenSpec validada no modo estrito. A validação estrutural não substitui os testes de comportamento.
- Imagens de desktop/celular geradas localmente e conferidas; imagens e resultados ficam ignorados pelo Git em `work/`/`test-results/`.

## Para conferir na demo

1. Recarregar a aplicação sem reiniciar os dados. Em **Nova aula**, escolher um aluno e um horário livre futuro; marcar **Repetir toda semana** e deixar **Repetir até** vazio. Avançar a semana e reencontrar a aula.
2. Abrir uma ocorrência futura e escolher **Remarcar aula**. Conferir **Somente esta aula** selecionado; mudar para outro dia/horário. As outras semanas devem manter o horário fixo.
3. A partir de uma ocorrência anterior à troca pontual, remarcar com **Esta e as próximas**. A troca futura também passa para o novo horário, sem aparecer duas vezes.
4. Criar um bloqueio em período livre. Tentar outro sobre uma aula: deve aparecer conflito e nenhuma aula muda. Abrir o bloqueio semanal e conferir o aviso de todas as semanas antes de confirmar sua remoção.
5. Recarregar e verificar persistência. Abrir uma aula passada e conferir que o registro continua disponível; aulas iniciadas não oferecem remarcação.
6. Conferir agenda e formulários no celular. No cadastro de aluno, os campos obrigatórios mostram `*` vermelho e os demais não mostram “Opcional”.

## Limites deste recorte

- Demo fictícia e local, sem autenticação, backend ou sincronização entre abas/dispositivos. Não houve publicação.
- Remover bloqueio semanal retira a regra inteira, após confirmação; não há desbloqueio de uma única ocorrência.
- Não há exclusão de aulas/séries nem edição de término de série existente. O término é escolhido na criação; mudança de horário usa a remarcação.
- Remarcação exige novo horário ainda não iniciado; novo período de uma série deve vir depois da ocorrência anterior e respeitar o término existente.
- Sem reposição, créditos ou recursos de IA. Acervo, homework e preparação de aula permanecem no 1C.
- Os testes não declaram que a rotina real já foi validada pela professora.

## Próximo passo

Revisar o fluxo semanal e registrar ajustes de uso. Depois, mediante autorização, especificar o 1C: autoria/formato do acervo, marcação de homework e escolha do material planejado. Consolidar os deltas e arquivar as mudanças após revisão da entrega.
