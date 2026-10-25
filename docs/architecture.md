# Direção técnica inicial

Status: demo do professor da etapa 1 implementada; fechamento inclui sequências autorais e apoios. O backend e o banco permanecem planejados; não há modelo físico de banco ou contratos de API definidos.

## Stack

| Etapa | Tecnologia | Motivo |
| --- | --- | --- |
| Interface e demo | React + TypeScript + Vite | Praticar componentes, estado, formulários e fluxo de dados em uma aplicação no navegador. |
| Piloto com servidor | C# + ASP.NET Core | Aproveitar a base de Cristian para API, regras de acesso e persistência. |
| Persistência do piloto | PostgreSQL | Trabalhar relações, restrições e consistência de dados. |

Versões suportadas e dependências serão verificadas ao iniciar cada etapa. Não instalar ferramentas ou definir autenticação, hospedagem, biblioteca de calendário e gerenciamento de estado sem necessidade atual.

## Estrutura do código

```text
nextage-class/
  docs/                  visão, decisões e planejamento
  openspec/              requisitos entregues e mudanças propostas
  web/                   aplicação React, criada na primeira implementação
    src/
      app/               composição, navegação e estrutura da interface
      domain/            regras, modelos, datas e dados fictícios
      data/              validação e persistência local
      features/          alunos, agenda, registros e materiais conforme surgirem
      shared/            componentes e funções de uso realmente compartilhado
  api/                   aplicação ASP.NET Core, criada na etapa com servidor
```

Essa organização é uma direção, não uma lista de pastas vazias a gerar antecipadamente. Testes acompanham os recortes quando protegem comportamento relevante. A localização concreta segue as ferramentas escolhidas na implementação.

## Fronteiras que precisamos preservar

- Componentes apresentam dados e ações; não devem concentrar todas as regras de agenda e armazenamento.
- Manter acesso ao armazenamento separado o suficiente para a demo local e o futuro servidor, sem construir uma infraestrutura genérica antecipada.
- Horário recorrente, ocorrência de aula e registro pedagógico têm responsabilidades diferentes.
- Validação de conflito precisa representar o horário ocupado e o intervalo, e não apenas a aparência da grade.
- Dias de aula não devem ser editados independentemente da agenda como uma segunda fonte de verdade.
- O histórico deve continuar significativo após alterações de nível, cadastro ou conteúdo. A estratégia concreta de versão/snapshot será escolhida na mudança que precisar dela.
- Separar material planejado do material efetivamente utilizado quando a preparação da aula for implementada.

## Demo local e aplicação com servidor

A primeira versão salva dados fictícios em um documento versionado no localStorage. Os dados são validados na leitura e antes da gravação. Ela não sincroniza dispositivos/abas nem oferece isolamento seguro por conta. Texto fictício cabe neste mecanismo; reavaliar conforme o acervo evoluir.

No 1B, séries semanais guardam períodos com índice inicial, data e hora. A consulta calcula somente as ocorrências da faixa pedida; cada ocorrência mantém ID de série + índice. Registros e trocas individuais materializam a ocorrência e prevalecem sobre o horário calculado. Mudar o futuro da série substitui exceções futuras e conserva aulas iniciadas. A ocupação é comparada por intervalos e dias semanais sem um horizonte fixo, antes de gravar qualquer mudança. O formato local v2 migra a demo anterior em memória, preservando a chave existente.

A demo deve poder voltar aos exemplos iniciais. No piloto com dados reais, autenticação, autorização no servidor, backup e recuperação fazem parte da entrega. Trocar um perfil na interface não equivale a autenticar uma pessoa.

Preservar a demo fictícia para o portfólio após a evolução do produto. Isso não obriga a reusar todos os detalhes internos nem a prometer uma migração automática do armazenamento local.

O formato local atual v6 mantém sequências, níveis atendidos, preparação, resultado pedagógico e solicitações. O progresso é consultado pela cronologia dos encontros, por aluno/sequência; não há ponteiro alterado por ordem de gravação. Material utilizado e continuidade preservam contexto histórico. Planejamentos continuam por ocorrência. Ver [pedagogy.md](pedagogy.md) e [course-progress.md](course-progress.md).

## O que não vamos antecipar

Microserviços, múltiplas organizações, infraestrutura de cobrança, editor de apresentações e integrações Google não são necessários para validar o primeiro fluxo. `api/` não será criado apenas para reservar uma arquitetura.

## Consulta do aluno — 2A

A função de domínio studentOverview produz um contrato explícito de leitura por aluno, reutilizando as consultas públicas da agenda. Exclui texto livre do lançamento, motivo de falta, planejamento e dados complementares do cadastro. A consulta de aulas/histórico recebe somente esse contrato e não permite edição. StudentPreview controla as ferramentas da simulação, com seleção apenas em memória. O fluxo da professora é preservado.

A redução de campos permite verificar o que a interface recebe, mas não oferece autorização real: a demo ainda mantém o documento completo no navegador e pode simular qualquer aluno fictício. O piloto exigirá identidade e política de acesso no servidor. Acervo e solicitações usam contratos separados, descritos abaixo.

## Acervo do aluno — 2B

studentLibrary produz outro contrato explícito de leitura, reutilizando materialsForLevel/materialLevels e courseSuggestion. Retorna somente conteúdo compatível com o nível atual e metadados públicos das sequências, com cópias dos arrays de níveis. Não entrega registros, planos ou dados pessoais à tela de acervo.

StudentLibrary recebe esse contrato, controla busca/filtro/leitura apenas em memória e não recebe callbacks de gravação. StudentPreview compõe as consultas com o mesmo aluno; a chave do portal descarta o contexto ao trocar de pessoa. O material histórico do 2A não depende do filtro do catálogo atual.

## Solicitações — 2C

availableRequestHours pertence ao módulo de disponibilidade e compara candidatos com as mesmas regras de ocupação da agenda, construídas uma vez por consulta. Retorna somente horas livres; não entrega nomes ou motivos de bloqueio. Horário semanal é verificado até o término informado ou sem término, sem horizonte artificial.

studentRequests produz um contrato explícito de pedidos próprios. StudentPreview vincula o aluno selecionado ao comando de envio; StudentRequests recebe apenas pedidos, consulta de horas livres e callback de solicitação. A tela não recebe Workspace nem comando de agendamento/decisão. As outras abas continuam em leitura.

decideSchedulingRequest reutiliza scheduleLesson/scheduleWeekly e acrescenta a decisão ao mesmo documento. Não é uma transação distribuída: a gravação local válida antecede a troca do estado exibido. Formato v6 acrescenta requests; os contratos v1–v5 seguem disponíveis para migração em memória, sem escrita durante leitura. Servidor e controle de concorrência real serão definidos na etapa 3.
