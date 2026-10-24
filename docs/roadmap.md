# Roadmap geral

Status: direção aprovada; recortes de entrega propostos abaixo. Sem datas estimadas até conhecermos o ritmo de desenvolvimento e validação. Uma fase pode conter várias mudanças OpenSpec.

Execução atual em 24/10/2026: OpenSpec 1.14.3 instalado e integrado; 1A, 1B e 1C implementados e verificados tecnicamente. Revisão de uso da demo do professor pendente. O fracionamento está em [delivery-chunks.md](delivery-chunks.md).

| Fase | Objetivo e escopo | Evidência para concluir |
| --- | --- | --- |
| 0 — Base do projeto | Visão, decisões, perguntas essenciais, stack, Git e organização OpenSpec. | Documentos consistentes; público inicial definido; primeira entrega identificada. |
| 1 — Demo do professor | Alunos, agenda, registro/histórico, materiais em texto e persistência fictícia local. | Completar uma semana fictícia, recarregar e reencontrar os dados; validar com a professora. |
| 2 — Demo do aluno | Próximas aulas, histórico permitido, acervo do nível e solicitação de horário com aprovação. | Percorrer os dois perfis simulados sem expor dados indevidos na interface. |
| 3 — Piloto de um professor | API C#, PostgreSQL, contas reais, autorização, backup e recuperação. | Uso real com acesso restrito e recuperação verificada; preservar demo fictícia separada. |
| 4 — Integrações | Validar e integrar Meet/Calendar; avaliar lembretes necessários. | Tratar falhas externas sem perder ou duplicar aulas; confirmar estratégia de links. |
| 5 — Materiais e acompanhamento | Áudio, apresentação e acompanhamento pedagógico conforme uso validado. | Recursos resolverem necessidades observadas, sem criar editor complexo antecipadamente. |
| 6 — Expansão eventual | Avaliar vários professores e administração necessária. | Existir demanda e definição de separação de dados/acessos. Não é compromisso da primeira versão. |

## Como dividir a fase 1

### 1A — Primeiro fluxo completo

Criar a aplicação React, sua navegação mínima e dados fictícios. Cadastrar aluno, marcar uma aula pontual, lançar presença/conteúdo e consultar histórico após recarregar. Permitir reiniciar a demo. Ver [first-delivery.md](first-delivery.md).

Este é o primeiro incremento funcional. Ainda não cobre a agenda final.

### 1B — Agenda de rotina

Implementado: horários recorrentes com término opcional, bloqueios manuais e remarcação com ambas as opções aprovadas. Alterar o futuro substitui trocas individuais futuras, preservando aulas iniciadas e registros. Conflitos são verificados além da semana visível. Conferir [verification-1b.md](verification-1b.md).

### 1C — Preparação e fechamento da demo

Implementado: acervo em texto por nível, material utilizado com cópia histórica, homework com descrição única/correção inteira reversível e preparação por ocorrência com último conteúdo e pendências. Cadastro inclui link manual da reunião. Migração e interface móvel verificadas; semana fictícia com a professora ainda depende de revisão de uso. Ver [verification-1c.md](verification-1c.md).

### Refinamento do 1C — Sequência e progresso

Implementado após esclarecimento de Cristian: aulas do material numeradas por nível; uma aula pode ocupar vários encontros. O lançamento retoma o ponto do aluno e registra em andamento/concluída, preservando trabalhado e continuidade como dados distintos. Progresso cronológico não regride por edição antiga. Ver [course-progress.md](course-progress.md).

## Próximos passos

1. Conferir uma semana fictícia completa com o [roteiro do 1C](verification-1c.md), incluindo preparação e fechamento da aula.
2. Revisar também a sequência e conclusão pelo lançamento; não confundir testes técnicos com aceitação da professora.
3. Consolidar os deltas do progresso e arquivar mudanças após revisão; a base técnica do 1A/1B/1C já está sincronizada.
4. Quando solicitado, especificar a demo do aluno: visibilidade do histórico, acesso ao acervo ao mudar de nível e solicitação de horário. Backend/contas reais continuam na fase 3.

## Fora deste roadmap

Não há funcionalidades de IA, reposições, saldo/créditos, cobrança ou migração automática do sistema atual. Turmas, menores e vários fusos não estão no escopo inicial. Streak e fim de semana permanecem ideias adiadas, sem fase prometida.
