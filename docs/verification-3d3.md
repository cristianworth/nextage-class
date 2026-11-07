# 3D3 — Disponibilidade e pedidos do aluno

O 3D3 conecta pedidos avulsos e semanais à API, sem reservar horário enquanto pendentes. A disponibilidade e o envio utilizam as regras da agenda e o mesmo lock transacional; respostas ao aluno não revelam nomes nem motivos de bloqueio. Os pedidos pertencem ao vínculo ativo, a duplicação idêntica do mesmo aluno é impedida e alunos distintos podem solicitar o mesmo horário. A decisão e a criação efetiva da aula permanecem no D4.

## Migração local e limites

A migração adiciona `app.scheduling_requests`, restrições, índices e RLS sem políticas públicas. A aplicação deve ocorrer primeiro em banco isolado e ser repetida; antes do banco de desenvolvimento, manter um backup recuperável e comparar os dados existentes. Não aplicar no Supabase hospedado nem criar identidades ou enviar convites por inferência. B4 real e 3E permanecem pendentes.
## Contrato e evidências

A API expõe GET /api/student/requests, GET /api/student/requests/availability e POST /api/student/requests, todos para o aluno ativo; o ID vem do vínculo no servidor. O envio revalida disponibilidade sob o lock da agenda. Datas, dias úteis, períodos, estados e duplicatas têm validação no servidor e restrições no banco. O pedido não altera a agenda; a aprovação transacional pertence ao D4.

Em banco de teste isolado, dois alunos solicitaram o mesmo horário, uma duplicata própria foi recusada e a consulta permaneceu isolada após recarga. Foram verificados conflito semanal distante, série remarcada, bloqueio, horário passado, fim de semana e respostas sem informações privadas. O backup de desenvolvimento está em work/verification-3d3/before.dump; uma cópia isolada foi restaurada e migrada duas vezes, preservando os dados de onze tabelas existentes.

## Verificação integrada

- 46 testes de API em PostgreSQL isolado; a primeira regressão revelou colisão entre horários de fixtures, corrigida e repetida com sucesso.
- Dois percursos Edge com identidade simulada e API/PostgreSQL reais de teste em computador e celular: envio de pedidos avulso e semanal, permanência após recarga e troca de sessão.
- 18 cenários simulados do piloto e um cenário adicional de falha que preserva os campos; 130 testes unitários de frontend e 49 percursos da demo aprovados. Build do piloto e validação estrita OpenSpec aprovados.
- Migração aplicada e repetida ao banco local de desenvolvimento após backup e ensaio isolado; onze tabelas existentes mantiveram seus dados. A operação não alterou o banco hospedado.

A revisão pessoal é opcional e está em [Pendente de Teste](pending-human-testing.md). A professora ainda não pode decidir os pedidos no piloto até a entrega do D4.
