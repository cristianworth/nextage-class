# Nextage Class

Agenda e acompanhamento pedagógico para professores particulares de idiomas: organizar encontros, retomar o conteúdo de cada aluno e registrar o que foi estudado.

Projeto pessoal de portfólio, construído com assistência de IA e decisões de produto guiadas por Cristian. A rotina é validada por Nara, professora de referência. A IA participa do desenvolvimento; não há recursos de IA no produto.

## O que a demo oferece

- Alunos, agenda semanal, bloqueios e remarcação de uma aula ou das próximas.
- Sequências didáticas para livros ou aulas próprias, com unidades numeradas e materiais de apoio por nível.
- Lançamento com histórico preservado, continuidade por aluno/sequência e escolha flexível do conteúdo.
- Homework simples: o que foi passado e sua correção inteira.
- Interface para computador/celular e persistência local validada, com migração sem reset.
- Consulta simulada do aluno: próximas aulas, link próprio, material histórico e homework em leitura.

**Etapa 1 aprovada por Nara**, conforme relato de Cristian em 24/10/2026. O fechamento esclarece sequências autorais e a seleção de apoio. O **2A da demo do aluno está entregue tecnicamente**; acervo para leitura (2B) e solicitações (2C) são os próximos recortes planejados. [Roadmap](docs/roadmap.md).

A demo usa dados fictícios no navegador. Contas reais, API ASP.NET Core/C# e PostgreSQL pertencem à etapa do piloto com servidor. A aplicação ainda não está hospedada.

## Executar

Requer Node.js 24 ou superior. Na raiz:

```powershell
npm ci
npm --prefix web ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Para acrescentar os exemplos novos aos dados existentes, usar **Acervo → Adicionar exemplos**. Não é necessário reiniciar a demo.

Para experimentar a consulta do aluno, use **Ver como aluno** e escolha um perfil fictício. O aluno consulta material e homework; conteúdo/observações livres ficam com a professora. [Roteiro e limites do 2A](docs/verification-2a.md).

## Qualidade e organização

React, TypeScript e Vite na interface; regras de negócio separadas dos componentes, validação de dados com Zod e verificações com Vitest/Playwright. OpenSpec registra requisitos, mudanças e decisões de implementação.

```powershell
npm test
npm run build
npm run format:check
npm run test:e2e
```

[Ambiente e execução dos testes](docs/local-development.md), incluindo alternativa com Edge. Resultados, imagens locais, credenciais e dados privados ficam fora do histórico Git.

| Caminho | Responsabilidade |
| --- | --- |
| `web/src/features/` | Fluxos e apresentação da aplicação |
| `web/src/domain/` | Regras, modelos e operações |
| `web/src/data/` | Persistência local e compatibilidade |
| `web/e2e/` | Cenários completos no navegador |
| `openspec/specs/` | Comportamento entregue |
| `openspec/changes/` | Recortes atuais em implementação ou revisão |
| `openspec/changes/archive/` | Histórico das mudanças concluídas |
| `docs/` | Produto, decisões, roadmap e evidências |

## Documentação

- [Guia dos documentos](docs/README.md): visão atual e histórico de entregas.
- [Sequências didáticas e apoios](docs/book-catalog.md): como organizar e usar o conteúdo.
- [Pesquisa e fechamento da etapa 1](docs/teaching-sequences.md): referências, escolhas, validação e propostas futuras.
- [Decisões de produto](docs/decisions.md) e [arquitetura](docs/architecture.md).

O sistema usado pela professora serve como referência de necessidades. Sua interface, código e acervo privado não são copiados para este projeto.
