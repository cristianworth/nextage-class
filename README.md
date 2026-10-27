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

A demo usa dados fictícios no navegador. A base ASP.NET Core/PostgreSQL do **3A está executável**; contas, cadastro mínimo/convites e telas de acesso do 3B estão implementados, com conferência integrada real pendente. A rotina completa no servidor segue no 3C/3D. A aplicação ainda não está hospedada.

## Identidade visual e apresentação do projeto

Em 27/10/2026, Cristian solicitou a revisão da identidade por considerar a interface excessivamente neutra e o símbolo genérico. A direção aprovada para o primeiro recorte é um **caderno de aulas contemporâneo**: uma área de trabalho para a professora, com referências aos materiais e à conversa que fazem parte do ensino de idiomas.

### Símbolo e favicon

<img src="web/public/favicon.svg" alt="Símbolo do Nextage Class: duas páginas abertas, lavanda e amarelo, separadas por uma margem central." width="72" height="72" />

O novo desenho é uma composição vetorial própria de duas páginas abertas, com uma margem central que separa os lados. A leitura de livro remete ao acompanhamento pedagógico; as duas partes também representam o diálogo entre professora e aluno. A página amarela funciona como um marcador visual. O símbolo substitui o monograma N e a seta ascendente anteriores.

O [SVG do favicon](web/public/favicon.svg) é também o arquivo usado pela marca na demo da professora, na simulação do aluno e no piloto. O [componente Brand](web/src/shared/Brand.tsx) mantém símbolo e nome consistentes. O desenho não depende de uma fonte, imagem gerada ou biblioteca de ícones. Essa é uma criação para o projeto, sem alegação de exclusividade ou registro de marca.

### Paleta e tipografia

| Cor | Valor | Uso no primeiro recorte |
| --- | --- | --- |
| Azul tinta | `#243C78` | Navegação e identidade |
| Azul de ação | `#345AC1` | Ações principais e foco sobre superfícies claras |
| Lavanda | `#EAE7FA` | Símbolo e detalhes de apoio |
| Amarelo marcador | `#F2BA62` | Página do símbolo, navegação selecionada e foco sobre azul tinta |
| Papel azulado | `#F3F5FC` | Fundo da área de trabalho |
| Tinta de leitura | `#25314A` | Texto principal |

A paleta é uma escolha do projeto, inspirada em cadernos e marcadores de estudo. Branco permanece nas superfícies de leitura e nos formulários. As cores auxiliares dos componentes específicos ainda serão revistas no próximo recorte; estados e ações continuam identificados por texto e estrutura, além da cor.

**DM Sans Variable**, já instalada e servida localmente, passa a compor nome, títulos, navegação e formulários. A hierarquia compartilhada usa título principal de 32 px no computador e 25 px no celular, títulos secundários de 22 px e textos auxiliares de 12–14 px. Os pesos diferenciam informação sem acrescentar outra família tipográfica. A importação de Manrope foi retirada; sua dependência permanece no manifesto nesta revisão parcial.

### Estrutura e escolhas

- A navegação azul tinta dá uma referência estável ao espaço da professora; a aba amarela identifica a seção atual. No celular, ela se torna uma faixa superior com os mesmos destinos.
- A agenda continua como entrada do produto. O primeiro recorte preserva sua composição e as regras existentes; não acrescenta uma página promocional entre a pessoa e o trabalho.
- Nome e símbolo substituem o tratamento anterior em caixa alta e com letras muito espaçadas. Os botões compartilhados recebem contornos mais definidos e deixam de usar sombra como destaque principal.
- Foco de teclado usa azul sobre fundos claros e amarelo na navegação escura. O desenho vetorial permite conferir o mesmo símbolo em tamanhos pequenos de favicon e maiores na interface.

**Estado da revisão:** direção e primeiro recorte aprovados para implementação por Cristian; aceite visual da entrega ainda pendente. Este recorte inclui marca/favicon, tokens, navegação e componentes compartilhados. A composição das telas, os cartões, os rótulos e as cores específicas da agenda, do acervo e do acesso ainda precisam de revisão após esse marco. Não representa o fechamento do 3B: a validação real de ativação/login continua pendente.

**Verificação técnica em 27/10/2026:** builds da demo e do piloto, formatação e os 49 cenários de navegador da demo e 11 do piloto aprovados em Edge. A agenda foi conferida sem rolagem horizontal nas larguras de 320, 390, 768 e 1440 px. Nas combinações compartilhadas, texto sobre fundo azulado mediu 11,92:1; branco no botão azul, 6,22:1; texto na aba amarela, 7,41:1. Capturas locais conferiram o símbolo a 16/32/64 px e em fundo escuro. Os testes do piloto continuam simulando Auth/API; não comprovam ativação ou recuperação reais no Supabase. Capturas e resultados brutos permanecem em `work/`, fora do histórico público.

### Fontes e créditos

Referências consultadas em 27/10/2026. A fundamentação do produto vem da [visão](docs/product-vision.md) e das [decisões validadas](docs/decisions.md); não foi copiada uma interface de outro serviço.

- [DM Fonts, fonte original da família DM Sans](https://github.com/googlefonts/dm-fonts): autoria e licença SIL Open Font License 1.1; a licença também acompanha o pacote `@fontsource-variable/dm-sans`. O repositório original está arquivado e é citado como crédito da fonte utilizada.
- [WCAG 2.2, contraste mínimo de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): referência para conferir pelo menos 4,5:1 em texto normal. As verificações do recorte são pontuais e não constituem uma auditoria completa de acessibilidade.
- [MDN, introdução ao SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch): referência técnica para o símbolo vetorial escalável. Não é a origem do desenho da marca.

## Executar

Requer Node.js 24 ou superior. Na raiz:

```powershell
npm ci
npm --prefix web ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Para acrescentar os exemplos novos aos dados existentes, usar **Acervo → Adicionar exemplos**. Não é necessário reiniciar a demo.

O servidor é independente da demo. SDK fixado em global.json, solução C# em api/NextageClass.slnx e scripts de desenvolvimento em scripts/. Ver [execução do servidor](docs/server-development.md) e [evidências 3A](docs/verification-3a.md).

O 3B usa [Supabase para banco e autenticação](docs/supabase-pilot.md). Identidade/vínculo na API, cadastro/convites e telas de entrada/ativação/recuperação estão implementados e testados localmente. A configuração administrativa foi aceita e o provedor confirmou o primeiro envio de convite à conta de teste autorizada; ativação, entrada e recuperação ainda aguardam conferência real. [Estado e limites](docs/account-access.md), [roteiro 3B](docs/verification-3b.md). A demo pública não exige conta e permanece separada do piloto. Para iniciar a interface do piloto, configurar web/.env.pilot.local pelo modelo web/.env.example e executar `npm run dev:pilot` (porta 5174).

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
