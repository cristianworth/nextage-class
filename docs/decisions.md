# Decisões validadas

Atualizado em 25/10/2026. Estas decisões orientam o planejamento; não significam que o sistema já foi implementado. Alterações futuras devem registrar o motivo e atualizar as especificações afetadas.

## Identidade e processo

| ID | Decisão |
| --- | --- |
| DEC-01 | Nome: Nextage Class. Repositório próprio em `D:\Repo\nextage-class`. |
| DEC-02 | Projeto pessoal para aprendizado e portfólio, validado com uma professora real. |
| DEC-03 | IA apenas como assistência ao desenvolvimento. Não há funcionalidades de IA no produto planejado. |
| DEC-04 | OpenSpec com uso enxuto e desenvolvimento incremental. Cristian guia decisões e valida resultados; a assistência de IA implementa e verifica, explicando escolhas relevantes. Não há tarefas de programação atribuídas a Cristian por padrão. |
| DEC-05 | Começar com documentação e uma demo fictícia com persistência no navegador. Evoluir para servidor antes do uso cotidiano com dados reais. |

## Público e acesso

| ID | Decisão |
| --- | --- |
| DEC-06 | Um professor inicialmente; vários professores são expansão posterior. |
| DEC-07 | Somente aulas individuais e alunos adultos na versão inicial. |
| DEC-08 | Um único fuso de referência no início. O identificador técnico será definido ao especificar datas e horários. |
| DEC-09 | O professor consulta seus alunos e suas aulas. O aluno consulta suas próprias aulas e dados permitidos. A disponibilidade de outros horários não expõe nomes, links ou detalhes de outros alunos. |
| DEC-10 | Perfis da demo são simulações. Autenticação e autorização reais pertencem à etapa com servidor. |

## Agenda e registros

| ID | Decisão |
| --- | --- |
| DEC-11 | Grade inicial de segunda a sexta; sábado e domingo ficam ocultos. Suporte a fim de semana é futuro. |
| DEC-12 | Blocos iniciam a cada hora, das 07h às 22h. Cada aula dura 55 minutos, seguida de 5 minutos de intervalo. O expediente termina às 23h. |
| DEC-13 | Separar horário recorrente, ocorrência em uma data e registro do que aconteceu. Remarcar uma ocorrência não reescreve automaticamente a série. |
| DEC-14 | Remarcação oferece “somente esta aula” e “esta e as próximas”. A opção padrão é sempre “somente esta aula”. Ambas fazem parte da entrega de remarcação. |
| DEC-15 | Verificar conflitos com aulas, bloqueios e intervalo antes de salvar; preservar agendamento anterior em caso de conflito ou desistência. Alterar o futuro não altera aulas passadas. |
| DEC-16 | Permitir bloqueio pontual e recorrente de horários. |
| DEC-17 | Não haverá reposição, créditos ou saldo de aulas. Falta/cancelamento têm tratamento simples, mantendo quem faltou e motivo livre opcional, sem taxonomia de justificativas. |
| DEC-18 | Registro guarda presença/falta, nível, material e conteúdo/observações. Preservar o contexto histórico quando cadastro, nível ou material forem alterados. Detalhes de edição ficam para a especificação. |
| DEC-19 | Separar data de cadastro e início das aulas. Dias/horários de aula devem vir da agenda, sem uma lista duplicada divergente no cadastro. |

## Conteúdo e rotina pedagógica

| ID | Decisão |
| --- | --- |
| DEC-20 | Níveis previstos: A1, A2, B1, B2, C1 e C2. Nível, módulo e aula de material são conceitos distintos. |
| DEC-21 | Homework consiste em registrar o que foi passado e o que foi corrigido. Não há envio de tarefa/arquivo pelo aluno. |
| DEC-22 | Antes da aula, facilitar consulta ao horário, homework, conteúdo anterior e material planejado. |
| DEC-23 | Aluno pode acessar o acervo de apoio do seu nível; não apenas o material da última aula. Após mudança de nível, o acervo segue o nível atual e o histórico preserva materiais já utilizados (DEC-51). |
| DEC-24 | Materiais começam em texto. Áudio, grids, zoom e apresentação ficam para depois. |
| DEC-25 | Streak fica adiado até definirmos uma regra coerente com faltas e períodos sem aulas. |
| DEC-26 | Link de reunião pode ser cadastrado manualmente no começo. Geração automática e estabilidade por aluno dependem de validação da integração Google; não prometer um link permanente antes disso. |
| DEC-27 | No 1A, nome e nível são obrigatórios no cadastro; telefone, ocupação e interesses são opcionais. |
| DEC-28 | Lançar apenas aulas ocorridas: dias anteriores ou hoje após o término da aula. Não permitir registros de aulas futuras. |
| DEC-29 | Cada aula possui no máximo um registro, que pode ser editado com indicação da última atualização. |
| DEC-30 | No cadastro de aluno, não exibir a palavra “Opcional” nos campos. Indicar os campos obrigatórios com asterisco vermelho, preservando a indicação nativa de obrigatoriedade para acessibilidade. |
| DEC-31 | Um horário fixo semanal pode repetir sem data final; o término é opcional. Um aluno pode ter mais de um horário fixo, em séries independentes. |
| DEC-32 | “Esta e as próximas” substitui também as remarcações individuais futuras da série. Aulas iniciadas/passadas e registros permanecem intactos. Remarcação troca uma aula existente, sem reposição ou crédito. |
| DEC-33 | Férias e feriados são tratados por bloqueios manuais. Ao atingir uma aula já marcada, o bloqueio informa o conflito e não altera aulas automaticamente. |
| DEC-34 | No 1C, homework tem uma descrição por aula, marcada como corrigida de uma vez. Não há tarefas múltiplas com correção individual ou parcial. Confirmado em 24/10/2026. |
| DEC-35 | As aulas do material seguem uma sequência dentro do nível; uma delas pode ocupar vários encontros da agenda, incluindo assuntos complementares. |
| DEC-36 | O lançamento retoma a aula do material atual do aluno. A professora informa se continua em andamento ou concluiu, determinando a continuidade. |
| DEC-37 | Separar a aula do material trabalhada no encontro da próxima aula sugerida: concluir a Aula 3 não muda o registro daquele encontro para Aula 4. |
| DEC-38 | Homework permanece no comportamento já entregue, sem expansão de recursos ou novo fluxo de correção no lançamento. |
| DEC-39 | No lançamento, nível é informação sem edição: vem do cadastro em novos registros e permanece o original ao editar um registro antigo. |
| DEC-40 | Livro/material será uma seleção única filtrada pelo nível; preservar textos e cópias históricas sem manter novo campo livre duplicado. |
| DEC-41 | Um aluno segue uma sequência principal e usa outros materiais como apoio. Organização por unidades e níveis atendidos entregue no 1E; o conjunto é apresentado como sequência didática (DEC-45). |
| DEC-42 | Exibir unidades como Unidade N — Descrição e ordenar numericamente, mantendo número separado do título. |
| DEC-43 | Cada livro possui uma sequência única de unidades, compartilhada entre todos os seus níveis atendidos. Confirmado para o 1E em 24/10/2026. |
| DEC-44 | Trocar o livro principal e retornar ao anterior retoma automaticamente o progresso daquele livro, sem reiniciar ou usar o progresso de outro. Confirmado para o 1E em 24/10/2026. |
| DEC-45 | Sequência didática abrange livros e aulas próprias da professora. Unidade é conteúdo, distinta do encontro na agenda. |
| DEC-46 | A ordem é sugerida: escolher Unidade 3 sem lançar a 2 não conclui nem remove a 2. Retomá-la depois é permitido. Marcação persistente de dispensa por aluno fica para discussão futura. |
| DEC-47 | Aceite do 1F por Nara informado por Cristian em 24/10/2026. Ajustes menores de fechamento possuem verificação técnica separada, sem presumir nova revisão humana de cada alteração. |
| DEC-48 | Unidades dispensadas/adiadas por aluno e vários apoios no mesmo registro ficam como melhorias possíveis, sem necessidade atual ou desenvolvimento nesta etapa. Confirmado em 25/10/2026. |
| DEC-49 | No 2A, aluno consulta material utilizado e homework; texto livre de Conteúdo trabalhado/observações fica reservado à professora. Confirmado em 25/10/2026. Motivo de falta e planejamento também não integram o contrato de consulta. |
| DEC-50 | O 2A é uma simulação explícita, sem edição pelo aluno. Seleção de perfil e navegação ficam em memória; não gravam ou alteram o documento local. Identidade/autorização reais permanecem na etapa com servidor. |
| DEC-51 | No 2B, Meu acervo oferece apenas conteúdo compatível com o nível atual, inclusive sequências e apoios compartilhados entre níveis. Após promoção, materiais de níveis anteriores ficam disponíveis somente pelas cópias das aulas no histórico. Confirmado em 25/10/2026. |
| DEC-52 | Abrir material no acervo não marca leitura/conclusão, não avança sequência e não altera homework. O progresso continua sendo informado pela professora no lançamento. |
| DEC-53 | No 2C, o aluno pode combinar vários horários semanais e aulas avulsas. Ex.: segunda/terça às 10h e quarta às 11h, mais uma aula avulsa. Cada horário é um pedido independente; avulsa é o padrão e término semanal é opcional. Confirmado em 25/10/2026. |
| DEC-54 | Todo pedido exige aprovação da professora. Pendente não reserva horário nem altera a agenda. A aprovação verifica novamente conflitos antes de criar uma aula ou série. Confirmado em 25/10/2026. |
| DEC-55 | Revisão integrada da etapa 2 com Nara confirmada por Cristian em 25/10/2026: “Revisamos e o fluxo atende”. Aceite de uso permite seguir ao piloto; testes técnicos permanecem evidência separada. |
| DEC-56 | No piloto, professora entra com e-mail/senha e convida alunos por e-mail para criarem sua senha. Não há cadastro público. Confirmado por Cristian em 25/10/2026. Provedor de envio e implantação serão definidos antes do uso real. |

Detalhes técnicos adotados para o 1A: referência de horário `America/Sao_Paulo`; material utilizado em texto livre até o acervo do 1C; dados exclusivamente fictícios na demo. São escolhas de implementação revisáveis, sem introduzir suporte a múltiplos fusos.

## Escolhas de implementação do 1C

O acervo simples e o planejamento opcional por ocorrência foram entregues antes da definição do progresso. Cristian esclareceu a sequência e autorizou seu refinamento em 24/10/2026 (DEC-35/36/37). Número por nível distingue aula do material de complementar; o progresso vem do lançamento, e o planejamento por ocorrência continua como apoio. Detalhes em [course-progress.md](course-progress.md). Isso não representa aceite de uso da professora.

## Tecnologia

React, TypeScript e Vite para a interface. ASP.NET Core com C# e PostgreSQL na etapa com servidor. Next.js não faz parte da stack escolhida. Não foram fixadas versões de bibliotecas, provedor de hospedagem ou solução de autenticação. Ver [architecture.md](architecture.md).
