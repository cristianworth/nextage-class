# 3D2 — Acervo e continuidade do aluno

Em 06/11/2026, Cristian solicitou esclarecer a ordem do roadmap e implementar o D2 sem aguardar revisão de uso por etapa. O piloto oferece busca, filtros e leitura dos materiais compatíveis com o nível atual e apresenta a continuidade da sequência principal. A API `GET /api/student/library` deriva a identidade do vínculo ativo, filtra o acervo no servidor e usa apenas o progresso do próprio aluno. A leitura é somente consulta e não altera registros nem homework. O histórico mantém a cópia utilizada na aula mesmo após edição do acervo e promoção de nível.

## Evidências

- 45 testes HTTP com PostgreSQL isolado, incluindo aluno sem sequência, sequência vazia/incompatível/finalizada, próxima unidade, duas identidades, parâmetro adulterado, 401/403, promoção e cópia histórica após edição do acervo.
- Dois percursos Edge com API e PostgreSQL de teste reais e identidade simulada, em computador e celular: busca, filtro, leitura e recarga; comparação dos registros antes e depois confirma que a consulta não alterou progresso ou homework.
- 18 cenários de acesso do piloto com serviços simulados, 130 testes unitários do frontend, compilação do piloto e validação estrita OpenSpec aprovados.
- Não houve migração, convite, conta real nem alteração de ambiente hospedado. A validação real do acesso de aluno e recuperação continua no B4, e a operação em 3E. A revisão pessoal é opcional e está em [Pendente de Teste](pending-human-testing.md).