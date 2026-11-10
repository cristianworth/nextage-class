# Inventário de recuperação do piloto — E1

Esta lista descreve o que deve ser recuperado; não comprova que a recuperação operacional hospedada já esteja pronta.

| Componente | Onde está | Limite da cópia local |
| --- | --- | --- |
| Cadastros e vínculos da aplicação | `app.students`, `app.access_profiles`, `app.student_invitations` | Preserva linhas e UUIDs dos vínculos; não recria as identidades do Supabase Auth. |
| Conteúdo e sequência | `app.books`, `app.materials`, vínculo principal do aluno | Inclui conteúdo e referências persistidas. |
| Agenda | `app.schedule_series`, `app.schedule_segments`, `app.schedule_lessons`, `app.schedule_blocks` | Inclui séries, segmentos, ocorrências e exceções materializadas. |
| Pedagogia | `app.lesson_records`, `app.lesson_plans` | Inclui cópias históricas, homework e progresso gravados nas linhas/JSON. |
| Solicitações | `app.scheduling_requests` | Inclui pendências, decisões e referências de agendamento. |
| Estrutura | `app.schema_migrations`, restrições, índices e permissões | Cópia local do banco; histórico e compatibilidade do destino precisam ser verificados. |
| Identidades e configuração Auth | Supabase Auth e configuração do projeto | Não são comprovadas pela cópia do schema `app`; exigem plano e validação próprios, sem substituir identidades existentes. |
| Segredos e configuração operacional | Ambiente privado do servidor/provedor | Não entram na cópia nem no Git; devem ter recuperação segura separada. |
| Objetos externos | Serviços escolhidos no 3E | Inventário e recuperação dependem da opção aprovada; nenhum serviço adicional é presumido. |

Para o ensaio, usar somente dados fictícios em banco local com sufixo `_tests` e destino novo separado. Nunca apontar o procedimento de ensaio para desenvolvimento, ambiente hospedado ou projeto GachaManagement.

Em 10/11/2026, Cristian aceitou como **ponto de partida**, sujeito a viabilidade: cópia protegida diária, retenção de sete dias, responsabilidade sua, perda desejada de até um dia e recuperação desejada em até um dia útil (DEC-63). Perda desejada é o intervalo de dados que talvez precisem ser refeitos desde a última cópia válida; recuperação desejada é o prazo para restaurar e conferir a operação após identificar o problema. Uma cópia diária não garante essas metas se falhar ou não puder ser restaurada. Permanecem em aberto o destino, a proteção, a verificação das cópias e a estratégia para Auth/configurações hospedados; nenhuma dessas metas foi demonstrada para dados reais.
