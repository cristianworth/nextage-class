# Solicitações de horário — 2C

## Contrato

Confirmado por Cristian em 25/10/2026: aluno pode combinar aulas avulsas e vários horários semanais, inclusive segunda/terça às 10h e quarta às 11h. Cada envio é um pedido independente. Avulsa é o padrão; no semanal a data escolhida é a primeira aula e o término é opcional.

Todo pedido precisa da aprovação da professora. Pendente não reserva nem cria encontros, permitindo dois alunos pedirem o mesmo horário. A disponibilidade considera aulas, remarcações e bloqueios em todo o período pedido, sem limite artificial de meses. O aluno recebe somente horas livres, sem nomes ou motivos de ocupação.

Aprovar confere novamente disponibilidade e início futuro; cria uma aula ou série exatamente uma vez. Se houver conflito, o pedido continua pendente. Recusar registra a decisão e não cria aulas. Se o horário já passou, a professora pode recusar e combinar um novo início; o sistema não muda datas silenciosamente.

O acompanhamento mostra somente os pedidos do aluno selecionado. Pedidos aprovados registram o horário solicitado originalmente; alterações posteriores aparecem em Minhas aulas. Sem edição de pedidos decididos, cancelamento pelo aluno, aprovação em lote ou justificativa livre nesta entrega.

## Persistência e limite da demo

Formato local v6 acrescenta `requests`. Dados válidos v1–v5 são carregados sem reset e migrados em memória; a leitura não grava. Apenas a próxima operação válida persiste o documento inteiro. Solicitar/decidir usa a mesma gravação atômica da agenda: falha não altera o estado exibido nem apresenta sucesso.

O aluno é selecionado nas ferramentas da demo; isso não equivale a identidade, isolamento ou autorização real. Contas, servidor e concorrência entre usuários pertencem à etapa 3. Só dados fictícios nesta fase.

## Verificação

Testes de domínio cobrem combinação de pedidos, não reserva, dados de consulta explícitos, duplicidade, dias/horas/início, conflitos distantes, término inclusivo, remarcações, aprovação única e recusas. Persistência cobre atualização v1–v5, recarga, falha de gravação e referências inválidas. Roteiro integrado e resultados ficam em verification-2c.md ao concluir a verificação.
