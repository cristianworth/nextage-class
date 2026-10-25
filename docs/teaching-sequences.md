# Sequências autorais — pesquisa e fechamento da etapa 1

## Decisão de produto

Cristian informou em 24/10/2026 que Nara aprovou o 1F. Depois esclareceu o uso de aulas próprias organizadas em uma sequência e a possibilidade de omitir conteúdos conforme o foco do aluno. Confirmou que escolher diretamente outra unidade atende ao recorte atual, sem cadastro de unidades dispensadas.

A unidade representa conteúdo; a aula na agenda representa o encontro. Uma sequência pode ser um livro ou conteúdo autoral. Apoio avulso fica separado. O percurso é decidido pela professora no lançamento e não exige completar cada unidade anterior.

## Referências consultadas

Pesquisa em documentação pública dos produtos em 24/10/2026. Serve de referência para decisões; não é avaliação prática dessas plataformas nem indicação de copiar sua interface.

| Referência | Comportamento documentado | Aplicação ao Nextage |
| --- | --- | --- |
| [Teachable — Sections and Lessons](https://support.teachable.com/en/articles/11682453-sections-and-lessons) | Conteúdo autoral organizado em seções e lições | Adotar um conjunto genérico de unidades, sem exigir livro comercial |
| [Teachable — Course Compliance](https://support.teachable.com/en/articles/11682463-course-compliance) | Ordem obrigatória é uma configuração; sem ela, permite navegação livre entre lições | Manter ordem como sugestão e seleção pela professora |
| [Thinkific — Prerequisite Lessons](https://support.thinkific.com/hc/en-us/articles/360030741153-Prerequisite-Lessons) | Pré-requisitos são uma regra explícita que bloqueia capítulos posteriores | Não introduzir bloqueios de conteúdo no escopo atual |

A síntese para o projeto é uma inferência de design: usar organização clara e percurso flexível, com poucas ações. Esses padrões não justificam adicionar um LMS completo, certificados, quizzes ou controles comerciais à agenda.

## Ajustes entregues

- Vocabulário de sequência na gestão, cadastro do aluno e mensagens; suporte a livros e conteúdo próprio com os mesmos dados v5.
- Campo **Conteúdo utilizado**, agrupado em unidades por sequência e apoios compatíveis.
- Apoio A1 fictício disponível em demo nova ou por Adicionar exemplos, sem reset.
- Explicação de escolha fora da ordem, retomada e fim da sequência sem conclusão presumida de conteúdos omitidos.
- README mais direto, índice documental e mudanças concluídas arquivadas com requisitos consolidados.

Não foi necessário alterar o algoritmo de progresso: ele já usa a unidade efetivamente lançada. O refinamento foi tornar essa liberdade explícita e protegê-la por cenários verificáveis.

## Evidências técnicas

- 87 testes de domínio/persistência aprovados; o novo cenário verifica 1 → 3, conclusão da última unidade sem concluir a 2 e retomada posterior da 2.
- 33 cenários completos de navegador aprovados, incluindo dois novos para sequência autoral/percurso flexível e apoio A1 no celular.
- Os seis cenários de catálogo foram repetidos após o ajuste da indicação de fim da sequência. Build/TypeScript, formatação e OpenSpec estrito aprovados.
- Conferida imagem móvel de 390 × 844: apoio selecionado, conteúdo e homework acessíveis, sem largura excedente. Testes usam contexto isolado; dados da prévia manual não foram reiniciados.

O aceite do 1F se refere ao fluxo informado por Cristian. Os ajustes posteriores têm verificação técnica; não se atribui a Nara uma nova revisão de cada texto.

## Evoluções para discussão

1. **Percurso individual persistido:** marcar conteúdos dispensados/adiados por aluno, com motivo e retomada. Exigiria distinguir estudo, conclusão e dispensa antes de qualquer percentual de progresso.
2. **Vários conteúdos no mesmo encontro:** unidade principal e vários apoios com cópias históricas. Alteraria o registro e a consulta; deve ser especificado antes de implementar.

Ambos permanecem propostas para evolução pedagógica, sem adiar a próxima etapa já planejada: a demo do aluno.
