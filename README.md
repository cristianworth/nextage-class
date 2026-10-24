# Nextage Class

Aplicação web para um professor particular organizar aulas individuais, registrar o conteúdo estudado e disponibilizar materiais aos alunos.

Projeto pessoal de aprendizado e portfólio, desenvolvido com assistência de IA e validação de uma professora real. IA faz parte do processo de desenvolvimento; não há funcionalidades de IA previstas no produto.

## Estado atual

Incrementos **1A–1E implementados e verificados tecnicamente**, com atualização em 24/10/2026. A demo reúne alunos, agenda pontual/semanal, bloqueios/remarcação, preparação por aula, acervo em texto por nível, registros com material histórico e homework passado/corrigido. Há link manual da reunião, persistência local e interface para computador/celular.

O refinamento do 1C acrescenta **sequência de aulas do material e progresso por aluno**: numeração inicialmente por nível, organizada por livro no 1E, retomada automática no lançamento e marcação de conclusão, preservando o conteúdo trabalhado. Ver [o funcionamento e roteiro](docs/course-progress.md).

O **1D simplifica o lançamento**: nível informativo, seleção única de Livro/material filtrada pelo nível e unidades em ordem numérica. Exemplos podem ser acrescentados ao acervo sem reiniciar a demo. Homework permanece como estava. Ver [evidências e roteiro do 1D](docs/verification-1d.md).

O **1E organiza livros, unidades e apoios**, com níveis atendidos e um principal por aluno. Trocar e voltar retoma o progresso de cada livro. Dados anteriores migram para v5 sem reset. Ver [organização do acervo](docs/book-catalog.md) e [verificação do 1E](docs/verification-1e.md).

OpenSpec **1.14.3** instalado localmente, com seis skills em `.agents/skills/`. As seis mudanças permanecem abertas para revisão de uso; a base até o 1D está sincronizada, e o 1E está em `organize-material-library-1e`. O [repositório é público no GitHub](https://github.com/cristianworth/nextage-class). A aplicação ainda não foi hospedada e não há autenticação ou backend.

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
| [Blocos da etapa 1](docs/delivery-chunks.md) | Resultados, dependências e conferência de cada bloco |
| [Verificação do 1A](docs/verification-1a.md) | Evidências técnicas, roteiro e limitações |
| [Verificação do 1B](docs/verification-1b.md) | Recorrência, bloqueios, remarcação e compatibilidade com a demo anterior |
| [Verificação do 1C](docs/verification-1c.md) | Acervo, preparação, homework e revisão integrada |
| [Verificação do 1D](docs/verification-1d.md) | Lançamento simplificado, filtro, histórico e exemplos sem reset |
| [Livros e unidades](docs/book-catalog.md) | Principal por aluno, níveis atendidos e retomada por livro |
| [Verificação do 1E](docs/verification-1e.md) | Catálogo, progresso por livro e migração v5 |
| [Dados pedagógicos](docs/pedagogy.md) | Modelo e limites do material planejado/utilizado e do homework |
| [Sequência e progresso](docs/course-progress.md) | Aula do material em vários encontros e continuidade pelo lançamento |
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
      features/    agenda, alunos, histórico e materiais
      shared/      componentes compartilhados
    e2e/           fluxos de navegador
```

`api/` será criado na etapa com servidor. Visão/roadmap descrevem também recursos futuros; as mudanças OpenSpec identificam o comportamento entregue para revisão.

## Primeira meta

Revisar o [1E](docs/verification-1e.md) e percorrer uma semana fictícia com Nara no **1F**, antes da demo do aluno. A validação automatizada não equivale à validação humana da rotina.

## Referências

- [OpenSpec](https://github.com/Fission-AI/OpenSpec): organização dos requisitos e mudanças.
- [Teachworks](https://www.teachworks.com/features/calendar): referência de fluxos de agenda e acompanhamento.
- [Cal.com](https://cal.com/): referência de disponibilidade e agendamento.

O sistema atualmente utilizado pela professora é referência de necessidades e rotina. Sua interface, implementação e acervo não serão copiados para o repositório. A imagem local apresentada por Cristian não faz parte deste projeto versionado.
