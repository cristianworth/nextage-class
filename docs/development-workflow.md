# Colaboração e desenvolvimento com OpenSpec

## Responsabilidades

- Cristian define a intenção, decide prioridades, acompanha as decisões técnicas e valida o resultado. Não pretende programar pessoalmente nesta etapa.
- A professora de referência valida o fluxo de uso; não precisa aprovar arquitetura ou ler documentos técnicos.
- A assistência de IA esclarece requisitos, compara opções, implementa os recortes autorizados e executa as verificações necessárias, apresentando evidências e limitações.

Explicar abstrações novas com exemplos pequenos quando ajudarem a acompanhar uma decisão. Não transformar o andamento em exercícios obrigatórios ou reservar tarefas para Cristian programar. Ele pode mudar essa preferência a qualquer momento. Decisões rotineiras seguem de forma autônoma; dúvidas que alteram produto ou arquitetura precisam ser esclarecidas antes do trabalho dependente.

## Qualidade do código

Usar nomes claros, responsabilidades coesas e organização proporcional ao problema. Separar apresentação, regras e acesso a dados quando essa divisão trouxer clareza. Evitar abstrações, camadas e padrões sem necessidade concreta. Tratar erros, preservar compatibilidade conforme o projeto evoluir e verificar regras importantes e efeitos colaterais plausíveis. Explicar os trade-offs relevantes sem narrar cada linha de código.

## Três tipos de documento

1. `docs/`: visão, decisões, roadmap e perguntas. Podem falar sobre o futuro, com status explícito.
2. `openspec/changes/`: propostas em andamento; requisitos e tarefas ainda não necessariamente entregues.
3. `openspec/specs/`: comportamento incorporado ao produto após implementação e validação.

As etapas 1 e 2 foram entregues; Cristian informou o aceite de Nara do 1F em 24/10/2026 e da revisão integrada 2D em 25/10/2026. Requisitos estão consolidados em `openspec/specs/`; propostas e tarefas concluídas ficam em `openspec/changes/archive/`. Não preencher as especificações atuais com toda a visão futura.

Ao arquivar uma mudança já sincronizada, conferir a base e preservar o histórico sem reaplicar deltas antigos sobre requisitos mais recentes. O modo estrito pode informar que um requisito ADDED já existe devido à sincronização prévia; isso não é falha dos testes nem confirmação de aceitação humana.

## Ciclo por mudança

1. Escolher um resultado pequeno e consultar decisões existentes.
2. Resolver apenas as perguntas que afetam esse resultado.
3. Descrever intenção, requisitos e cenários verificáveis.
4. Discutir decisões relevantes e organizar tarefas pequenas que Cristian consiga acompanhar.
5. Implementar em partes, preservando o escopo.
6. Executar verificações relevantes e conferir o fluxo na interface.
7. Atualizar especificações entregues e arquivar a mudança, sem promover pendências a comportamento pronto.
8. Registrar a entrega em commit coeso, respeitando as regras de changelog e versão.

Cristian autorizou execução contínua pelo roadmap em 25/10/2026. Ao terminar cada etapa, avaliar impedimentos e decisões que dependam dele; sem isso, seguir ao próximo recorte. Reavaliar o plano também a cada três chunks de etapas maiores e ao descobrir uma nova restrição. Corrigir primeiro documentos/regras afetados. Em ambiguidade material ou tentativas repetidas sem progresso, formular uma pergunta com recomendação. A autorização não converte ideias condicionais em funcionalidades obrigatórias nem substitui escolhas sobre contratação, dados reais ou aceite humano.

## Preparação da ferramenta

OpenSpec é uma ferramenta de desenvolvimento orientado por especificações: organiza documentos, mudanças e instruções para a assistência de IA. Sua CLI é um programa de terminal que depende de Node.js. A integração fornece instruções/skills para a ferramenta de desenvolvimento utilizada. OpenSpec não executa a agenda nem define a arquitetura do aplicativo; o usuário final não precisa dele para usar o Nextage Class.

A CLI OpenSpec 1.14.3 está instalada como dependência de desenvolvimento da raiz. A integração gerou seis skills em `.agents/skills/`, preservando `openspec/config.yaml`. Usar `npm run spec -- <comando>` na raiz. Não é necessária instalação global.

Ao configurar a integração, usar uma versão identificada e começar pelo fluxo essencial. Evitar customizar schemas ou alterar configurações globais sem necessidade. A forma de invocar ações varia conforme a ferramenta usada; seguir a ajuda da integração efetivamente instalada.

## Revisão e conclusão

Uma tarefa marcada não basta. Conferir critérios de aceite, efeitos plausíveis, resultado visual quando houver e persistência quando aplicável. Registrar limitações e o que não foi testado. Revisão por IA e validação estrutural de documentos complementam essa evidência.

Antes de commit ou merge, procurar e ler o changelog. Se existir, avaliar o impacto e consultar Cristian sobre versão/changelog, salvo autorização já dada. Não criar changelog ou incremento de versão antecipadamente. O repositório público e os pushes foram autorizados; hospedagem da aplicação depende do recorte operacional.

## Continuidade entre chats

Em 26/10/2026, Cristian solicitou uma passagem a partir do 3B. O [handoff](handoffs/2026-10-26-resume-3b.md) e seu [prompt de continuidade](handoffs/2026-10-26-resume-3b-prompt.md) preservam o snapshot, sem substituir as fontes atuais. O sucessor deve verificar divergências e apresentar primeiro contexto/plano com evidências; após alinhamento, apresentar o primeiro recorte e sua verificação antes de ampliar o trabalho. Cristian pode validar diretamente ou dispensar um marco explicitamente.

O chat de origem é referência histórica e de revisão; código atual, testes e decisões atuais prevalecem. O fluxo de revisão manual por Cristian funciona sem comunicação entre chats. Não enviar mensagens diretamente nem criar um chat para completar a passagem sem autorização correspondente. Os artefatos não transportam credenciais nem transformam sugestões recentes em requisitos aprovados.

## Referências do processo

- [Primeiros passos](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md).
- [Configuração por projeto](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md).
- [Revisão de mudanças](https://github.com/Fission-AI/OpenSpec/blob/main/docs/reviewing-changes.md).
