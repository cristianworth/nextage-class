# Nextage Class

Aplicação web para um professor particular organizar aulas individuais, registrar o conteúdo estudado e disponibilizar materiais aos alunos.

Projeto pessoal de aprendizado e portfólio, desenvolvido com assistência de IA e validação de uma professora real. IA faz parte do processo de desenvolvimento; não há funcionalidades de IA previstas no produto.

## Estado atual

Incrementos **1A e 1B implementados e verificados tecnicamente** em 23/10/2026. A demo permite cadastrar/editar alunos, agendar aulas pontuais ou semanais, bloquear horários, remarcar uma aula ou o futuro da série, lançar/editar registros e consultar o histórico, com persistência local. Há versão para computador e consulta por dia no celular.

OpenSpec **1.14.3** instalado localmente, com seis skills da integração de desenvolvimento em `.agents/skills/`. As mudanças `deliver-teacher-demo-1a` e `deliver-weekly-agenda-1b` permanecem abertas para revisão de uso; a base do 1A foi sincronizada em `openspec/specs/`. Homework/acervo (1C) estão planejados, sem implementação. Não há autenticação, backend ou publicação.

## Executar

Requer Node.js 24 ou superior. Na raiz:

```powershell
npm ci
npm --prefix web ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. [Instruções e verificações](docs/local-development.md).

## Por onde começar

| Documento | O que responde |
| --- | --- |
| [Visão do produto](docs/product-vision.md) | Para quem estamos construindo e qual problema queremos resolver |
| [Decisões](docs/decisions.md) | O que Cristian já validou e quais são os limites iniciais |
| [Roadmap](docs/roadmap.md) | Como sair da documentação e chegar ao piloto |
| [Blocos 1A/1B/1C](docs/delivery-chunks.md) | Resultados, dependências e conferência de cada bloco |
| [Verificação do 1A](docs/verification-1a.md) | Evidências técnicas, roteiro e limitações |
| [Verificação do 1B](docs/verification-1b.md) | Recorrência, bloqueios, remarcação e compatibilidade com a demo anterior |
| [Questões de planejamento](docs/core-questions.md) | O que precisava ser definido agora e quais respostas recebemos |
| [Detalhes para depois](docs/deferred-questions.md) | Dúvidas que serão tratadas perto da funcionalidade |
| [Arquitetura inicial](docs/architecture.md) | Stack, limites e estrutura pretendida para o código |
| [Colaboração e OpenSpec](docs/development-workflow.md) | Como dividir o desenvolvimento e manter os requisitos |
| [Primeira entrega funcional](docs/first-delivery.md) | Qual fluxo vamos implementar primeiro e como conferir |
| [Estrutura OpenSpec](openspec/README.md) | Como distinguir planos de comportamento já entregue |

## Organização atual

```text
nextage-class/
  README.md
  AGENTS.md
  docs/            visão, decisões, roadmap, blocos e verificações
  openspec/        especificações e mudanças
  .agents/skills/  integração OpenSpec gerada pela ferramenta
  web/             aplicação React e testes
    src/
      app/         composição e navegação
      domain/      modelos, operações e datas
      data/        persistência local
      features/    agenda, alunos e histórico
      shared/      componentes compartilhados
    e2e/           fluxos de navegador
```

`api/` será criado na etapa com servidor. Visão/roadmap descrevem também recursos futuros; as mudanças do 1A e 1B identificam o comportamento entregue para revisão.

## Primeira meta

Revisar a agenda semanal com Cristian e a professora usando o [roteiro do 1B](docs/verification-1b.md). Depois, detalhar acervo, homework e preparação de aula do 1C. A validação automatizada não equivale à validação humana da rotina.

## Referências

- [OpenSpec](https://github.com/Fission-AI/OpenSpec): organização dos requisitos e mudanças.
- [Teachworks](https://www.teachworks.com/features/calendar): referência de fluxos de agenda e acompanhamento.
- [Cal.com](https://cal.com/): referência de disponibilidade e agendamento.

O sistema atualmente utilizado pela professora é referência de necessidades e rotina. Sua interface, implementação e acervo não serão copiados para o repositório. A imagem local apresentada por Cristian não faz parte deste projeto versionado.
