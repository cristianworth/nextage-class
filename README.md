# Nextage Class

Aplicação web para um professor particular organizar aulas individuais, registrar o conteúdo estudado e disponibilizar materiais aos alunos.

Projeto pessoal de aprendizado e portfólio, desenvolvido com assistência de IA e validação de uma professora real. IA faz parte do processo de desenvolvimento; não há funcionalidades de IA previstas no produto.

## Estado atual

Base documental criada em 23/10/2026. Ainda não há aplicação, dependências instaladas, autenticação, banco de dados ou publicação. A estrutura do OpenSpec está preparada manualmente; a CLI e suas integrações ainda não foram instaladas.

## Por onde começar

| Documento | O que responde |
| --- | --- |
| [Visão do produto](docs/product-vision.md) | Para quem estamos construindo e qual problema queremos resolver |
| [Decisões](docs/decisions.md) | O que Cristian já validou e quais são os limites iniciais |
| [Roadmap](docs/roadmap.md) | Como sair da documentação e chegar ao piloto |
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
  docs/
    product-vision.md
    decisions.md
    roadmap.md
    core-questions.md
    deferred-questions.md
    architecture.md
    development-workflow.md
    first-delivery.md
  openspec/
    README.md
    config.yaml
    specs/
    changes/
```

As pastas `web/` e `api/` serão criadas quando suas etapas começarem. A documentação não representa funcionalidades prontas.

## Primeira meta

Completar um fluxo com dados fictícios: cadastrar aluno, agendar uma aula, registrar presença/conteúdo e consultar o histórico após recarregar o navegador. A primeira entrega funcional é um recorte da demo do professor, não toda a agenda final.

## Referências

- [OpenSpec](https://github.com/Fission-AI/OpenSpec): organização dos requisitos e mudanças.
- [Teachworks](https://www.teachworks.com/features/calendar): referência de fluxos de agenda e acompanhamento.
- [Cal.com](https://cal.com/): referência de disponibilidade e agendamento.

O sistema atualmente utilizado pela professora é referência de necessidades e rotina. Sua interface, implementação e acervo não serão copiados para o repositório. A imagem local apresentada por Cristian não faz parte deste projeto versionado.
