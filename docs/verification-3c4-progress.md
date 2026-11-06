# 3C4 — Continuidade por aluno e sequência

Em 06/11/2026, Cristian autorizou seguir com validação técnica autônoma e reunir as revisões pessoais opcionais em uma lista. O 3C4 agora conecta o resultado da unidade e sua continuidade ao piloto. A unidade trabalhada e a próxima referência são informações distintas; o resultado fica ligado ao lançamento, por aluno, livro e data/hora efetiva.

Em andamento retoma a unidade; concluída indica a próxima disponível. Falta, apoio e ausência de material não apagam o resultado anterior. A professora pode selecionar outra unidade, sem concluir as omitidas. A sugestão reutiliza a regra da demo, tanto na aula quanto no cadastro; edições de texto/homework preservam a referência histórica. Registros criados antes deste recorte não recebem progresso presumido: para informar seu resultado, selecione explicitamente a unidade no lançamento.

## Evidências novas

- 42 testes HTTP com PostgreSQL isolado, incluindo gravação, edição, correção de homework e preservação da referência após alteração do catálogo.
- 130 testes de domínio, incluindo cronologia no adaptador do piloto e leitura de cópia histórica com horário em UTC expresso por deslocamento.
- Dois percursos Edge com API e PostgreSQL reais e identidade simulada passaram em computador e celular, incluindo seleção sugerida, conclusão da unidade, recarga e sugestão da próxima. A primeira execução revelou incompatibilidade na leitura de timestamp de material histórico; a leitura foi corrigida e os percursos foram repetidos.
- 17 cenários do piloto com serviços simulados, builds do piloto e da demo pública e 22 validações estritas OpenSpec passaram. Uma primeira execução com dois navegadores teve falhas na inicialização do Edge; a execução com um navegador por vez passou.
- Migração aditiva aplicada e repetida nos bancos de teste e desenvolvimento local. Backup em `work/verification-3c4-progress/before.dump`; comparação preservou o conteúdo anterior de onze tabelas. Nenhuma migração hospedada foi aplicada.

As revisões pessoais opcionais estão em [Pendente de Teste](pending-human-testing.md). B4, portal 3D e operação 3E não são concluídos por estes testes. O acabamento visual do histórico e menu permanece registrado no roadmap.
