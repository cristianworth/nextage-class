# Direção técnica inicial

Status: frontend do 1A/1B/1C implementado. O backend e o banco permanecem planejados; não há modelo físico de banco ou contratos de API definidos.

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

O formato local v4 mantém acervo e preparação e acrescenta numeração e resultado pedagógico no registro. O progresso é consultado pela cronologia dos encontros, por aluno/nível; não há ponteiro alterado por ordem de gravação. Material utilizado e continuidade guardam contexto histórico. Planejamentos continuam por ocorrência. Ver [pedagogy.md](pedagogy.md) e [course-progress.md](course-progress.md).

## O que não vamos antecipar

Microserviços, múltiplas organizações, infraestrutura de cobrança, editor de apresentações e integrações Google não são necessários para validar o primeiro fluxo. `api/` não será criado apenas para reservar uma arquitetura.
