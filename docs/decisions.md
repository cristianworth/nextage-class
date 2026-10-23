# Decisões validadas

Atualizado em 23/10/2026. Estas decisões orientam o planejamento; não significam que o sistema já foi implementado. Alterações futuras devem registrar o motivo e atualizar as especificações afetadas.

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
| DEC-23 | Aluno pode acessar o acervo de apoio do seu nível; não apenas o material da última aula. Regras após mudança de nível serão detalhadas depois. |
| DEC-24 | Materiais começam em texto. Áudio, grids, zoom e apresentação ficam para depois. |
| DEC-25 | Streak fica adiado até definirmos uma regra coerente com faltas e períodos sem aulas. |
| DEC-26 | Link de reunião pode ser cadastrado manualmente no começo. Geração automática e estabilidade por aluno dependem de validação da integração Google; não prometer um link permanente antes disso. |

## Tecnologia

React, TypeScript e Vite para a interface. ASP.NET Core com C# e PostgreSQL na etapa com servidor. Next.js não faz parte da stack escolhida. Não foram fixadas versões de bibliotecas, provedor de hospedagem ou solução de autenticação. Ver [architecture.md](architecture.md).
