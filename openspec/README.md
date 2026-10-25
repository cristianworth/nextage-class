# OpenSpec no Nextage Class

OpenSpec 1.14.3 instalado localmente, com integração em `.agents/skills/`.

- `config.yaml`: contexto e regras das próximas mudanças.
- `specs/`: requisitos atuais, consolidados após a implementação e verificação.
- `changes/`: recortes em andamento, quando houver.
- `changes/archive/`: propostas, requisitos e tarefas das entregas concluídas; preservam o processo do portfólio.

A etapa 1 recebeu aceite de Nara, informado por Cristian em 24/10/2026. O fechamento de sequências autorais possui verificação técnica própria. 2A e 2B estão em `deliver-student-overview-2a` e `deliver-student-library-2b`, entregues tecnicamente e aguardando revisão de uso; 2C/2D continuam planejados. Ver `docs/roadmap.md`.

Usar `npm run spec -- list` para mudanças ativas e `npm run spec -- validate --all --strict` para a base atual. Arquivos arquivados não devem ser reaplicados sobre requisitos mais recentes.

Consultar [o workflow](../docs/development-workflow.md) e [o guia documental](../docs/README.md).
