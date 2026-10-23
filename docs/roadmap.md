# Roadmap geral

Status: direção aprovada; recortes de entrega propostos abaixo. Sem datas estimadas até conhecermos o ritmo de desenvolvimento e validação. Uma fase pode conter várias mudanças OpenSpec.

Execução atual: OpenSpec 1.14.3 instalado e integrado; blocos A1–A6 implementados e verificados tecnicamente. Revisão com Cristian e professora pendente. O fracionamento de 1A, 1B e 1C está em [delivery-chunks.md](delivery-chunks.md).

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

Adicionar horários recorrentes, bloqueios e remarcação com as duas opções aprovadas. Tornar a agenda adequada ao uso semanal e conferir conflitos e preservação do passado.

### 1C — Preparação e fechamento da demo

Adicionar acervo em texto por nível, homework passado/corrigido e preparação da próxima aula. Conferir cadastro completo, estados vazios/erro, navegação no celular e semana fictícia com a professora. Campos e comportamentos serão detalhados nas mudanças correspondentes.

## Próximos passos

1. Conferir a demo do 1A com o [roteiro de verificação](verification-1a.md).
2. Registrar ajustes e revisão de uso sem confundir testes técnicos com aceitação da professora.
3. Consolidar as especificações e arquivar a mudança do 1A quando a revisão da entrega estiver satisfeita.
4. Resolver regras de recorrência/exceções e detalhar o primeiro bloco de 1B antes de implementá-lo.

## Fora deste roadmap

Não há funcionalidades de IA, reposições, saldo/créditos, cobrança ou migração automática do sistema atual. Turmas, menores e vários fusos não estão no escopo inicial. Streak e fim de semana permanecem ideias adiadas, sem fase prometida.
