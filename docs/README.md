# Documentação do Nextage Class

As etapas 1 e 2 foram aprovadas conforme relato de Cristian. O piloto conectado 3C/3D foi verificado tecnicamente; a operação 3E está em andamento e B4 real permanece aberto. Consulte o [roadmap atual](roadmap.md).

## Visão atual

A [demo pública](public-demo.md) das etapas 1/2 foi publicada e conferida em 29/10/2026; [evidências](verification-public-demo.md). O piloto com servidor continua separado, com B4 pendente.

Acesso da professora, cadastro, agenda, lançamento e preparação tiveram aceite informado por Cristian; as demais revisões pessoais opcionais estão em [Pendente de Teste](pending-human-testing.md). A recuperação real e o acesso real do aluno seguem no B4; E3 prepara a operação. [Roadmap atual](roadmap.md) · [Histórico do roadmap](roadmap-history.md).

| Documento                                                      | Finalidade                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Visão do produto](product-vision.md)                          | Problema, público e limites                                               |
| [Roadmap](roadmap.md)                                          | Estado das entregas e próximos recortes                                   |
| [Histórico do roadmap](roadmap-history.md)                     | Evolução do planejamento e situações registradas em cada data             |
| [Pendente de Teste](pending-human-testing.md)                  | Revisões pessoais opcionais e distinção das verificações reais necessárias |
| [Operação e opções de hospedagem](hosting-options-3e.md)       | Alternativas, limitações e sinais para reavaliar a infraestrutura         |
| [Verificação do preparo 3E3](verification-3e3.md)              | Imagem, testes e limites da implantação                                   |
| [Roteiro de implantação](pilot-deployment-runbook.md)          | Configuração, verificação, migrações e recuo antes da liberação           |
| [Decisões](decisions.md)                                       | Respostas validadas e regras de produto                                   |
| [Consulta do aluno 2A](verification-2a.md)                     | Próximas aulas, histórico permitido, homework e evidências                |
| [Acervo do aluno 2B](verification-2b.md)                       | Conteúdo compatível, continuidade, leitura e acesso após mudança de nível |
| [Solicitações de horário](scheduling-requests.md)              | Pedidos combináveis, disponibilidade e decisão individual                 |
| [Verificação do 2C](verification-2c.md)                        | Roteiro aluno → professora → aluno, erros e evidências                    |
| [Fechamento 2D](verification-2d.md)                            | Aceite de uso, fluxo integrado e decisão de avançar ao servidor           |
| [Desenvolvimento do servidor](server-development.md)           | SDK, PostgreSQL isolado, execução e testes                                |
| [Verificação do 3A](verification-3a.md)                        | Processo, conexão real, indisponibilidade e preservação da demo           |
| [Supabase no piloto](supabase-pilot.md)                        | Decisão do provedor, responsabilidades, plano gratuito e limites          |
| [Acesso autenticado](account-access.md)                        | Identidade, cadastro/convites, telas de acesso e limites do 3B            |
| [Verificação parcial 3B](verification-3b.md)                   | Evidências locais, roteiro e configuração real pendente                   |
| [Handoff do 3B — 26/10/2026](handoffs/2026-10-26-resume-3b.md) | Snapshot, pendências e protocolo para o sucessor                          |
| [Sequências e apoio](book-catalog.md)                          | Organização de conteúdo atual                                             |
| [Continuidade](course-progress.md)                             | Como o lançamento determina o próximo conteúdo                            |
| [Pesquisa e fechamento](teaching-sequences.md)                 | Referências, escolhas e evidências atuais                                 |
| [Dados pedagógicos](pedagogy.md)                               | Material utilizado, planejamento e homework                               |
| [Arquitetura](architecture.md)                                 | Responsabilidades e stack                                                 |
| [Identidade visual](visual-design.md)                          | Marca, paleta, tipografia e referências                                   |
| [Desenvolvimento local](local-development.md)                  | Como executar e verificar                                                 |
| [Colaboração/OpenSpec](development-workflow.md)                | Requisitos e processo de desenvolvimento                                  |
| [Questões futuras](deferred-questions.md)                      | Perguntas para a etapa correspondente                                     |

## Evidências históricas

Estes documentos descrevem o recorte e o estado de verificação na data de cada entrega. Contagens de testes, nomes de campos e versões locais anteriores não substituem os documentos atuais.

- [Primeiro ciclo 1A](verification-1a.md), [agenda 1B](verification-1b.md), [preparação 1C](verification-1c.md), [lançamento 1D](verification-1d.md) e [acervo 1E](verification-1e.md).
- [Primeira entrega](first-delivery.md), [blocos da etapa 1](delivery-chunks.md) e [perguntas iniciais resolvidas](core-questions.md) preservam a evolução do planejamento.
- Mudanças OpenSpec concluídas ficam em `openspec/changes/archive/`. Os requisitos atuais ficam em `openspec/specs/`.

O aceite da professora é registrado a partir da informação fornecida por Cristian; testes automatizados são evidência técnica separada.
