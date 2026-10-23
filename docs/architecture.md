# Direção técnica inicial

Status: stack aprovada; estrutura de código proposta, ainda não criada. Não há modelo físico de banco ou contratos de API definidos.

## Stack

| Etapa | Tecnologia | Motivo |
| --- | --- | --- |
| Interface e demo | React + TypeScript + Vite | Praticar componentes, estado, formulários e fluxo de dados em uma aplicação no navegador. |
| Piloto com servidor | C# + ASP.NET Core | Aproveitar a base de Cristian para API, regras de acesso e persistência. |
| Persistência do piloto | PostgreSQL | Trabalhar relações, restrições e consistência de dados. |

Versões suportadas e dependências serão verificadas ao iniciar cada etapa. Não instalar ferramentas ou definir autenticação, hospedagem, biblioteca de calendário e gerenciamento de estado sem necessidade atual.

## Estrutura pretendida quando houver código

```text
nextage-class/
  docs/                  visão, decisões e planejamento
  openspec/              requisitos entregues e mudanças propostas
  web/                   aplicação React, criada na primeira implementação
    src/
      app/               composição, navegação e estrutura da interface
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

A primeira versão salva dados fictícios no navegador. Ela não sincroniza dispositivos nem oferece isolamento seguro por conta. O mecanismo local exato será escolhido no planejamento da primeira entrega, considerando o volume de dados em texto.

A demo deve poder voltar aos exemplos iniciais. No piloto com dados reais, autenticação, autorização no servidor, backup e recuperação fazem parte da entrega. Trocar um perfil na interface não equivale a autenticar uma pessoa.

Preservar a demo fictícia para o portfólio após a evolução do produto. Isso não obriga a reusar todos os detalhes internos nem a prometer uma migração automática do armazenamento local.

## O que não vamos antecipar

Microserviços, múltiplas organizações, infraestrutura de cobrança, editor de apresentações e integrações Google não são necessários para validar o primeiro fluxo. `api/` não será criado apenas para reservar uma arquitetura.
