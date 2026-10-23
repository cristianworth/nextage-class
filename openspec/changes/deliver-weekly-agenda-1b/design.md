# Design

## Context

O 1A guarda aulas pontuais e registros por identificador no localStorage. Séries não podem gerar uma lista infinita nem perder identidade ao trocar dia da semana. Ver proposta e especificações para o escopo.

## Goals / Non-Goals

**Goals:** preservar dados existentes, histórico, identidade das ocorrências e atomicidade das mudanças; verificar conflitos sem horizonte artificial.

**Non-Goals:** reposição, cancelamento automático em feriados, biblioteca de calendários, backend ou funcionalidades do 1C.

## Decisions

- Schema local v2 acrescenta séries e bloqueios. Manter a chave existente, validar v1 e converter em memória; somente uma gravação bem-sucedida substitui o conteúdo anterior. Não há reset obrigatório.
- Série semanal tem segmentos com índice inicial, data da primeira ocorrência do segmento e hora. Identidade da ocorrência é série + índice; trocar de terça para quarta não troca a identidade. Data final é opcional.
- Consultas geram apenas as ocorrências da faixa solicitada. Aulas registradas ou remarcadas individualmente ficam materializadas em `lessons` e prevalecem sobre a ocorrência virtual de mesmo ID.
- Alterar “esta e as próximas” substitui os segmentos futuros e as exceções futuras, preservando aulas iniciadas/registradas como ocorrências materializadas. Exigir ordem cronológica entre segmentos e novo horário futuro.
- Conflitos usam regras de ocupação pontuais ou semanais, comparando intervalos de validade e horas. Ocorrências materializadas excluem suas posições virtuais. Verificar interseção semanal matematicamente e pular somente exceções finitas, sem limitar a checagem à tela ou a um número fixo de semanas.
- Bloqueio usa data, intervalo de horas e repetição semanal opcional; pode ocupar um dia inteiro. Remover bloqueio semanal retira a regra inteira, com confirmação clara; não há exceção de desbloqueio individual neste recorte.
- Novos formulários seguem os diálogos existentes. Remarcação recorrente oferece ambos os alcances com o individual selecionado; aviso explica que futuras trocas individuais também serão atualizadas.

## Risks / Trade-offs

- Identidade virtual e materialização podem duplicar aulas → um ID determinístico por série/índice e precedência do materializado, com testes de histórico e recarga.
- Conflitos em séries indefinidas podem ficar escondidos → algoritmo de interseção sem horizonte fixo e testes em datas distantes.
- Remarcação em lote pode perder histórico → operações puras, validação da proposta inteira antes de gravar e proteção de aulas iniciadas/registradas.
- Migração pode apagar a demo → validar a versão de origem antes de converter e preservar valor bruto em falhas.

## Migration Plan

Migrar v1 para v2 apenas em memória na leitura. Persistir v2 na próxima alteração válida, na mesma chave. Manter rejeição de versões desconhecidas e reset exclusivamente explícito. Sem publicação.
