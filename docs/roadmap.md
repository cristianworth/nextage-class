# Roadmap do Nextage Class

Atualizado em 24/10/2026. Direção de produto revisada com Cristian. Sem datas estimadas artificiais. Implementação técnica e revisão de uso são estados separados.

## Ordem geral

| Etapa | Resultado | Estado e critério de saída |
| --- | --- | --- |
| 0 — Fundação | Visão, decisões, Git, stack e OpenSpec | Concluída tecnicamente |
| 1 — Demo do professor | Rotina de agenda, conteúdo, lançamento e acervo em texto | Concluída; aceite do 1F informado por Cristian em 24/10/2026 e ajustes menores de fechamento entregues |
| 2 — Demo do aluno | Próximas aulas, histórico permitido, acervo compatível e solicitação de horário | Planejar após estabilizar a rotina do professor; perfis ainda simulados |
| 3 — Piloto com servidor | API ASP.NET Core/C#, PostgreSQL, contas e autorização, backup/recuperação | Uso real somente com acesso restrito e recuperação verificada; demo fictícia separada |
| 4 — Integrações úteis | Meet/Calendar e lembretes conforme necessidade | Validar contas, permissões e falhas; link manual atende até lá |
| 5 — Conteúdo e acompanhamento ampliados | Arquivos, áudio, apresentação e recursos pedagógicos que o uso justificar | Priorizar necessidades observadas; não antecipar editor complexo |
| 6 — Expansão eventual | Vários professores e administração | Depende de demanda e definição de separação de dados; sem compromisso na primeira versão |

## Etapa 1 — Demo do professor

### 1A — Primeiro ciclo completo: entregue tecnicamente

Alunos, aula pontual, lançamento editável, histórico e persistência local. Ver [verification-1a.md](verification-1a.md).

### 1B — Agenda da rotina: entregue tecnicamente

Recorrência com término opcional, bloqueios e remarcação individual/da série, preservando passado e tratando conflitos em toda a validade. Ver [verification-1b.md](verification-1b.md).

### 1C — Preparação e acompanhamento: entregue tecnicamente

Acervo inicial em texto, preparação por encontro, cópia do material utilizado, link manual e homework simples. O refinamento de progresso permite repetir uma unidade em vários encontros e avançar pelo lançamento. Ver [verification-1c.md](verification-1c.md) e [course-progress.md](course-progress.md).

Homework permanece como está: uma descrição por aula, correção inteira reversível e consulta de pendências. Nenhuma expansão de tarefas ou mudança no fluxo de correção está planejada agora.

### 1D — Lançamento simples e consistente: entregue tecnicamente

Ver [verification-1d.md](verification-1d.md). Nível visível sem edição, determinado pelo cadastro ou pelo registro histórico. Um seletor Livro/material filtrado pelo nível; sem novo texto livre duplicado. Unidade N — Descrição com ordem numérica, cópias históricas preservadas e exemplos adicionáveis à demo sem reset. A hierarquia completa de livros e níveis múltiplos permanece no 1E.

### 1E — Acervo organizado e sequência principal: entregue tecnicamente

Ver [book-catalog.md](book-catalog.md) e [verification-1e.md](verification-1e.md). O acervo separa livros, suas unidades e materiais de apoio. Confirmado: um aluno segue uma sequência principal e usa outros materiais como apoio. A ordem e o progresso pertencem ao livro/sequência, permitindo Unidade 1 em livros diferentes.

Livros e apoios atendem um ou vários níveis sem duplicação; a sequência do livro é compartilhada entre seus níveis. Trocar e retornar retoma o progresso anterior. Migração v5 preserva dados locais v1–v4 sem reset. Conteúdo continua em texto fictício/autorizado; arquivos e apresentação rica permanecem posteriores.

### 1F — Revisão com Nara: aprovada

Cristian informou o aceite de Nara em 24/10/2026. O fechamento esclarece sequências de aulas autorais, categorias de conteúdo e escolha fora da ordem, preservando dados e homework. Ver [pesquisa, decisões e evidências](teaching-sequences.md). O aceite humano e a verificação técnica dos ajustes posteriores são registrados separadamente.

## Como avançar

1. Conferir os ajustes menores do [fechamento da etapa 1](teaching-sequences.md).
2. Especificar a etapa 2: demo do aluno, com as perguntas de visibilidade e solicitações antes da implementação.
3. Usar requisitos consolidados e histórico arquivado da etapa 1 como base; não reabrir decisões respondidas sem novo contexto.
4. Na etapa 2, decidir visibilidade do histórico, acesso após troca de nível e fluxo de aprovação de solicitações. Não antecipar essas respostas no lançamento do professor.

## Limites mantidos

Um professor, alunos adultos, aulas individuais e um fuso. Sem recursos de IA no produto, reposição, saldo/créditos, cobrança ou migração automática do sistema atual. Turmas, menores, vários fusos, streak e fim de semana permanecem fora do escopo inicial.

## Propostas para evolução pedagógica

- Percurso individual persistido: unidades dispensadas/adiadas por aluno, com motivo e retomada. Exige definir a diferença entre dispensar e concluir.
- Vários conteúdos por encontro: unidade principal e apoios com histórico próprio. Exige mudança no modelo do registro.

São propostas para a etapa 5, sujeitas a discussão de prioridade; não foram implementadas nem substituem a etapa 2. O salto manual já atende ao recorte atual confirmado por Cristian.
