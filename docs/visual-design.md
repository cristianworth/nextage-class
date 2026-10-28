# Identidade visual do Nextage Class

Em 27/10/2026, Cristian solicitou a revisão da identidade por considerar a interface excessivamente neutra e o símbolo genérico. A direção aprovada para o primeiro recorte é um **caderno de aulas contemporâneo**: uma área de trabalho para a professora, com referências aos materiais e à conversa que fazem parte do ensino de idiomas.

### Símbolo e favicon

<img src="images/brand.svg" alt="Símbolo do Nextage Class: duas páginas abertas, lavanda e amarelo, separadas por uma margem central." width="72" height="72" />

O novo desenho é uma composição vetorial própria de duas páginas abertas, com uma margem central que separa os lados. A leitura de livro remete ao acompanhamento pedagógico; as duas partes também representam o diálogo entre professora e aluno. A página amarela funciona como um marcador visual. O símbolo substitui o monograma N e a seta ascendente anteriores.

O [SVG documentado](images/brand.svg) é uma cópia do símbolo da revisão local de 27/10/2026, cuja publicação de interface ainda está pendente. Nessa revisão, o componente `Brand` mantém símbolo e nome consistentes na demo da professora, na simulação do aluno e no piloto. O desenho não depende de uma fonte, imagem gerada ou biblioteca de ícones. Essa é uma criação para o projeto, sem alegação de exclusividade ou registro de marca.

### Paleta e tipografia

| Cor              | Valor     | Uso no primeiro recorte                                          |
| ---------------- | --------- | ---------------------------------------------------------------- |
| Azul tinta       | `#243C78` | Navegação e identidade                                           |
| Azul de ação     | `#345AC1` | Ações principais e foco sobre superfícies claras                 |
| Lavanda          | `#EAE7FA` | Símbolo e detalhes de apoio                                      |
| Amarelo marcador | `#F2BA62` | Página do símbolo, navegação selecionada e foco sobre azul tinta |
| Papel azulado    | `#F3F5FC` | Fundo da área de trabalho                                        |
| Tinta de leitura | `#25314A` | Texto principal                                                  |

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

Referências consultadas em 27/10/2026. A fundamentação do produto vem da [visão](product-vision.md) e das [decisões validadas](decisions.md); não foi copiada uma interface de outro serviço.

- [DM Fonts, fonte original da família DM Sans](https://github.com/googlefonts/dm-fonts): autoria e licença SIL Open Font License 1.1; a licença também acompanha o pacote `@fontsource-variable/dm-sans`. O repositório original está arquivado e é citado como crédito da fonte utilizada.
- [WCAG 2.2, contraste mínimo de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): referência para conferir pelo menos 4,5:1 em texto normal. As verificações do recorte são pontuais e não constituem uma auditoria completa de acessibilidade.
- [MDN, introdução ao SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch): referência técnica para o símbolo vetorial escalável. Não é a origem do desenho da marca.
