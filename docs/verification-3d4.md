# 3D4 — Decisão da professora

A professora pode consultar, filtrar, aprovar e recusar solicitações no piloto. A aprovação adquire o mesmo lock da agenda, relê o pedido e os conflitos de todo o período, cria a aula ou série e grava a decisão na mesma transação. Uma recusa preserva a agenda. Pedido já decidido não cria outra aula; conflito ou falha mantém a pendência. O aluno consulta a decisão e a aula confirmada no próximo acesso.

## Evidências

- 48 testes de API em PostgreSQL isolado, incluindo aprovações concorrentes, concorrência com alteração da agenda, revalidação semanal distante, repetição, recusa, permissão e falha forçada após inserir a aula; a falha confirmou rollback tanto da aula quanto da decisão.
- Dois percursos Edge com API/PostgreSQL reais de teste e identidade simulada em computador e celular: aluno solicita, professora aprova, recarrega e aluno vê decisão e próxima aula. A primeira execução revelou transbordamento no celular após acrescentar o menu; a navegação foi corrigida e os dois percursos foram repetidos com sucesso.
- 19 cenários simulados do piloto passaram; o cenário adicional de conflito passou após correção da rota da fixture, comprovando mensagem e pendência após recarga. Sete cenários de solicitações da demo, 130 testes unitários, build do piloto e validação estrita OpenSpec passaram.
- A API e o piloto foram preparados localmente; nenhuma migração, conta real, convite ou alteração hospedada foi necessária. Acesso real do aluno e recuperação continuam no B4; operação e publicação permanecem no 3E. Revisão pessoal é opcional, em [Pendente de Teste](pending-human-testing.md).