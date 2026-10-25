# Nextage Class

Agenda e acompanhamento pedagógico para professores particulares de idiomas: organizar encontros, retomar o conteúdo de cada aluno e registrar o que foi estudado.

Projeto pessoal de portfólio, construído com assistência de IA e decisões de produto guiadas por Cristian. A rotina é validada por Nara, professora de referência. A IA participa do desenvolvimento; não há recursos de IA no produto.

## O que a demo oferece

- Alunos, agenda semanal, bloqueios e remarcação de uma aula ou das próximas.
- Sequências didáticas para livros ou aulas próprias, com unidades numeradas e materiais de apoio por nível.
- Lançamento com histórico preservado, continuidade por aluno/sequência e escolha flexível do conteúdo.
- Homework simples: o que foi passado e sua correção inteira.
- Interface para computador/celular e persistência local validada, com migração sem reset.
- Consulta simulada do aluno: próximas aulas, link próprio, histórico, homework e acervo do nível atual em leitura.
- Pedidos avulsos e semanais pelo aluno, com acompanhamento e aprovação/recusa individual pela professora; pendente não reserva horário.

**Etapa 1 aprovada por Nara**, conforme relato de Cristian em 24/10/2026. **Etapa 2 aprovada na revisão integrada com Nara**, conforme confirmação de Cristian em 25/10/2026. O próximo ciclo é o piloto com servidor, começando pela base executável. [Fechamento 2D](docs/verification-2d.md) e [roadmap](docs/roadmap.md).

A demo usa dados fictícios no navegador. A base ASP.NET Core/PostgreSQL do **3A está executável**, com verificações de processo e banco; contas e fluxos persistidos seguem nos próximos recortes do piloto. A aplicação ainda não está hospedada.

## Executar

Requer Node.js 24 ou superior. Na raiz:

```powershell
npm ci
npm --prefix web ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Para acrescentar os exemplos novos aos dados existentes, usar **Acervo → Adicionar exemplos**. Não é necessário reiniciar a demo.

O servidor é independente da demo. SDK fixado em global.json, solução C# em api/NextageClass.slnx e scripts de desenvolvimento em scripts/. Ver [execução do servidor](docs/server-development.md) e [evidências 3A](docs/verification-3a.md).

O 3B usa [Supabase para banco e autenticação](docs/supabase-pilot.md). Identidade/vínculo na API, cadastro/convites e telas de entrada/ativação/recuperação estão implementados e testados localmente. A conferência real de contas/e-mail ainda depende da configuração privada e do usuário inicial. [Estado e limites](docs/account-access.md), [roteiro 3B](docs/verification-3b.md). A demo pública não exige conta e permanece separada do piloto. Para iniciar a interface do piloto, configurar web/.env.pilot.local pelo modelo web/.env.example e executar `npm run dev:pilot` (porta 5174).

Para experimentar a consulta do aluno, use **Ver como aluno** e escolha um perfil fictício. O aluno consulta material, homework e **Meu acervo** do nível atual; conteúdo/observações livres ficam com a professora. [Consulta 2A](docs/verification-2a.md) e [acervo 2B](docs/verification-2b.md).

Em **Solicitações**, o aluno pode enviar um pedido por horário e combinar dias semanais com aulas avulsas. Na área da professora, **Solicitações** permite aprovar ou recusar cada um. Aprovar confere novamente se o período continua livre. [Regras e limites](docs/scheduling-requests.md) e [roteiro 2C](docs/verification-2c.md).

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
| `api/` | Servidor ASP.NET Core e testes HTTP com PostgreSQL |
| `scripts/` | Execução local e verificação do servidor |
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
