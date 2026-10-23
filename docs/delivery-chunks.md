# Blocos de entrega da demo do professor

Atualizado em 23/10/2026. 1A e 1B implementados e verificados tecnicamente; 1C permanece planejado. Cada bloco resulta em comportamento conferível. Refinar o 1C perto da execução, sem antecipar código.

## 1A — Primeiro fluxo completo

Blocos A1–A6 implementados e verificados tecnicamente. A revisão de uso continua pendente; conferir [verification-1a.md](verification-1a.md).

| Bloco | Resultado | Dependência | Conferência |
| --- | --- | --- | --- |
| A1 — Fundação | React/TypeScript/Vite, navegação, layout responsivo, dados fictícios e ferramentas de verificação | OpenSpec configurado | Abrir agenda/alunos/histórico e executar build |
| A2 — Dados locais | Estado versionado no navegador, exemplos determinísticos, reset confirmado e falhas de armazenamento tratadas | A1 | Recarregar; simular falha/corrupção sem sobrescrever dados silenciosamente |
| A3 — Alunos | Listar, pesquisar, cadastrar e editar aluno; nome/nível obrigatórios | A2 | Cadastrar e editar; campos opcionais podem ficar vazios |
| A4 — Aula pontual | Agendar data/aluno/horário na grade; conferir conflitos; abrir detalhes | A3 | Rejeitar conflito e horários fora da grade; manter a aula anterior intacta |
| A5 — Registro | Lançar presença/falta, conteúdo, material em texto e nível; editar o registro existente | A4 | Bloquear aula não ocorrida; manter um registro por aula e preservar snapshots históricos |
| A6 — Histórico e revisão | Consultar/filtrar histórico; conferir fluxo completo, celular, persistência e documentação | A5 | Testes de regras, armazenamento e navegador; revisão da professora fica registrada separadamente |

## 1B — Agenda de rotina

B1–B5 implementados; verificação técnica de B6 concluída. A revisão da rotina com a professora permanece pendente. Ver [verification-1b.md](verification-1b.md) e a mudança `deliver-weekly-agenda-1b`.

| Bloco | Resultado | Dependência |
| --- | --- | --- |
| B1 — Regras de recorrência | Término opcional; feriados/férias por bloqueios; atualizar exceções futuras ao mudar a série | 1A e respostas de rotina |
| B2 — Horário semanal | Cadastrar série e gerar/consultar ocorrências sem duplicação | B1 |
| B3 — Bloqueios | Bloqueio pontual e semanal; conflito com aulas existentes | B2 |
| B4 — Remarcação individual | Mover somente uma ocorrência com verificação de conflito | B2/B3 |
| B5 — Remarcação da série | Oferecer também “esta e as próximas”, preservando passado e tratando exceções | B4; especificação inclui as duas opções e padrão individual |
| B6 — Revisão semanal | Conferir séries, exceções e persistência com a professora | B5 |

B4 e B5 são blocos internos da mesma funcionalidade: a entrega pública de remarcação terá ambas as opções, com “somente esta aula” selecionada por padrão.

## 1C — Preparação e fechamento (planejamento)

| Bloco | Resultado | Dependência |
| --- | --- | --- |
| C1 — Acervo em texto | Cadastrar/consultar materiais por nível, com conteúdo autorizado/fictício | 1A; confirmar autoria/formato |
| C2 — Material utilizado | Relacionar material cadastrado ao registro preservando o conteúdo histórico | C1 e A5 |
| C3 — Homework | Registrar o que foi passado e corrigido, sem submissão de arquivos | Definir múltiplas tarefas/correção parcial |
| C4 — Preparação | Mostrar último conteúdo, homework e material planejado na próxima aula | C2/C3 |
| C5 — Perfil e acabamento | Completar campos úteis do aluno, link manual da aula e estados de interface | Validar necessidades concretas |
| C6 — Semana demonstrável | Revisão integrada, acessibilidade, celular e documentação da demo | 1B e C1–C5 |

O portal do aluno, backend, contas reais e integrações permanecem nas fases posteriores do [roadmap](roadmap.md).
