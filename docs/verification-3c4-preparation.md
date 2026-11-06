# 3C4 — Preparação e contexto anterior

Em 05/11/2026, Cristian validou o primeiro recorte de registros e autorizou o próximo passo. Ele também apontou transbordamento de descrição no histórico e diferenças no menu em relação à demo; o roadmap registra esses pontos para acabamento visual antes do uso real.

O piloto permite preparar uma ocorrência não encerrada e sem registro com material opcional e anotações, editar ou retirar o plano e consultá-lo nos detalhes da aula. O plano acompanha a identidade da ocorrência em remarcações individuais e da série. Uma mudança de série que deixaria uma aula planejada fora do término é rejeitada na transação. Os detalhes também exibem a última presença estritamente anterior do mesmo aluno, pelo horário efetivo. Pendências de homework e progresso ainda não estão conectados.

## Evidência técnica

- 40 testes HTTP com PostgreSQL isolado, incluindo cenário novo de planejamento, remarcações e rejeição integral, além das regressões de registros e agenda.
- Dois percursos integrados Edge com identidade simulada, API e PostgreSQL reais, em computador e celular; cobrem planejamento, remarcações, registro e contexto anterior.
- 127 testes de domínio, incluindo dois novos para o contexto cronológico; build do piloto e validação estrita dos 22 itens OpenSpec existentes aprovados.
- A migração aditiva foi aplicada e repetida no banco de testes e no desenvolvimento local. Backups em `work/verification-3c4-preparation` confirmaram preservação do conteúdo das dez tabelas anteriores. O banco hospedado não foi alterado.
- API local reiniciada e pronta; piloto HTTP 200. A revisão de uso deste recorte segue pendente.

## Limites

O material planejado é uma referência ao acervo atual, separado da cópia histórica do material usado no lançamento. A sugestão de continuidade e a consulta/correção de homework permanecem em recortes próprios do 3C4. A revisão de uso do acervo, o B4 e a operação hospedada mantêm seus estados próprios.
