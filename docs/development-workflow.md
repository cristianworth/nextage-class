# Colaboração e desenvolvimento com OpenSpec

## Responsabilidades

- Cristian define a intenção, decide prioridades e desenvolve recortes escolhidos para praticar.
- A professora de referência valida o fluxo de uso; não precisa aprovar arquitetura ou ler documentos técnicos.
- A assistência de IA ajuda a esclarecer requisitos, comparar opções, implementar tarefas combinadas e revisar evidências.

Explicar abstrações novas com exemplos pequenos. Alternar implementação conjunta, variações feitas por Cristian e automação de trabalho repetitivo. A divisão é combinada por mudança, sem exigir percentuais fixos de código.

## Três tipos de documento

1. `docs/`: visão, decisões, roadmap e perguntas. Podem falar sobre o futuro, com status explícito.
2. `openspec/changes/`: propostas em andamento; requisitos e tarefas ainda não necessariamente entregues.
3. `openspec/specs/`: comportamento incorporado ao produto após implementação e validação.

Hoje não há comportamento implementado nem mudança funcional aberta. Não preencher as especificações atuais com toda a visão futura.

## Ciclo por mudança

1. Escolher um resultado pequeno e consultar decisões existentes.
2. Resolver apenas as perguntas que afetam esse resultado.
3. Descrever intenção, requisitos e cenários verificáveis.
4. Discutir solução e tarefas proporcionais; combinar o recorte de aprendizado.
5. Implementar em partes, preservando o escopo.
6. Executar verificações relevantes e conferir o fluxo na interface.
7. Atualizar especificações entregues e arquivar a mudança, sem promover pendências a comportamento pronto.
8. Registrar a entrega em commit coeso, respeitando as regras de changelog e versão.

Não executar uma implementação inteira só porque uma ferramenta produziu uma lista de tarefas. O trabalho deve seguir o recorte combinado. Ajustes pequenos não exigem refazer toda a documentação.

## Preparação da ferramenta

O esqueleto segue o formato documentado do OpenSpec, incluindo `config.yaml`, `specs/` e `changes/`. A CLI e as integrações ainda não foram instaladas; isso fica para preparar a primeira mudança funcional. Não afirmar que comandos estão disponíveis antes de conferir o ambiente.

Ao configurar a integração, usar uma versão identificada e começar pelo fluxo essencial. Evitar customizar schemas ou alterar configurações globais sem necessidade. A forma de invocar ações varia conforme a ferramenta usada; seguir a ajuda da integração efetivamente instalada.

## Revisão e conclusão

Uma tarefa marcada não basta. Conferir critérios de aceite, efeitos plausíveis, resultado visual quando houver e persistência quando aplicável. Registrar limitações e o que não foi testado. Revisão por IA e validação estrutural de documentos complementam essa evidência.

Antes de commit ou merge, procurar e ler o changelog. Se existir, avaliar o impacto e consultar Cristian sobre versão/changelog, salvo autorização já dada. Esta base documental não cria versão de aplicação ou changelog antecipadamente. Sem remoto ou publicação nesta etapa.

## Referências do processo

- [Primeiros passos](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md).
- [Configuração por projeto](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md).
- [Revisão de mudanças](https://github.com/Fission-AI/OpenSpec/blob/main/docs/reviewing-changes.md).
