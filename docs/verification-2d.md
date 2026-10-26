# Fechamento do 2D — Fluxo integrado

Revisão de uso confirmada por Cristian em 25/10/2026: “Revisamos e o fluxo atende”, em resposta à consulta sobre aulas, acervo e solicitações com Nara. Esse aceite é distinto dos resultados automatizados abaixo.

Na conferência posterior, Cristian também confirmou explicitamente: “localhost:5173 testada e aprovada”. Esse aceite refere-se à demo; o piloto autenticado da porta 5174 tem validação própria no 3B.

## Conferência adicional

O cenário `approved weekly request survives rescheduling, lesson entry and student consultation` em `web/e2e/integrated-flow.spec.ts` passou no Edge. Ele verifica um pedido semanal aprovado, remarcação de somente um encontro, horário vigente na consulta do aluno, registro após o término, material/homework compartilhados e observações reservadas. O pedido preserva a decisão original; ocorrência e registro mantêm o mesmo identificador. A próxima semana e a recarga conservam os dados.

Esse teste complementa os 48 cenários de navegador e 109 testes de domínio/persistência aprovados no 2C. A única alteração executável do 2D foi acrescentar esse cenário; não houve mudança de regra ou fluxo. A demo manual e seu armazenamento não foram alterados. Evidências visuais e regressões dos recortes anteriores continuam nos documentos 2A–2C.

## Avaliação do roadmap

O ciclo fictício dos dois perfis está aprovado para encerrar a etapa 2. Não apareceu impedimento de produto nessa revisão. O próximo objetivo é transformar a demo em piloto com identidade e persistência no servidor, preservando a versão fictícia para portfólio.

Contas por e-mail/senha com convite da professora, sem cadastro público, foram confirmadas por Cristian em 25/10/2026. Provedor de e-mail, hospedagem, retenção e recuperação operacional ainda precisam de decisões no momento correspondente. As etapas 4–6 continuam condicionais ao valor observado, sem ampliar automaticamente o escopo para vários professores ou recursos pedagógicos dispensados.
