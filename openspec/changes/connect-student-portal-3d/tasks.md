# Tasks

## 1. D1 — Consulta própria e isolamento

- [x] 1.1 Implementar consulta autenticada pelo vínculo ativo, sem ID de aluno fornecido pelo cliente, com link próprio, até seis próximas aulas efetivas (incluindo em andamento) e histórico compartilhado; verificar com dois alunos, semanal remarcada, recarga, negação de acesso cruzado e ausência explícita de campos privados no JSON.
- [x] 1.2 Conectar aulas e histórico do aluno no piloto sem alterar a demo nem oferecer acervo ou pedidos ainda não conectados; verificar com navegador, API e PostgreSQL reais de teste, identidade simulada, falha, recarga, saída/troca e sessão sem vínculo.
- [x] 1.3 Documentar contrato, limites e evidências de D1, inclusive 401/403 e negativa das rotas teacher; atualizar `docs/pending-human-testing.md` sem exigir aceite opcional.

## 2. D2 — Acervo e continuidade

- [x] 2.1 Implementar projeção própria do acervo compatível e continuidade no servidor; testar promoção de nível, cópia histórica, sequência vazia/incompatível/finalizada e isolamento de alunos.
- [x] 2.2 Conectar busca, filtros e leitura do acervo de aluno e verificar que navegar/recarregar não grava progresso ou homework; cobrir computador/celular e documentar evidências de D2.

## 3. D3 — Disponibilidade e pedidos

- [x] 3.1 Criar migração aditiva para pedidos e restrições, testar aplicação/repetição e preservação de dados em PostgreSQL isolado; documentar limites e backup antes do banco local.
- [x] 3.2 Expor disponibilidade sem nomes ou motivos e verificar horário futuro, conflito distante, repetição sem término, remarcações e bloqueios, comparando cenários da demo.
- [x] 3.3 Persistir pedidos próprios avulsos/semanais independentes sem reserva; testar duplicatas do mesmo aluno, dois alunos no mesmo horário, isolamento e recarga; documentar contrato e evidências.
- [x] 3.4 Conectar formulário e acompanhamento do aluno, preservando campos em erro; verificar envio, combinações, recarga e troca de sessão em navegador com dados fictícios.

## 4. D4 — Decisão da professora

- [x] 4.1 Implementar aprovação/recusa com revalidação de todo o período sob o lock da agenda e transação única; testar aprovação concorrente, alteração concorrente, repetição de decisão e rollback.
- [x] 4.2 Conectar lista e decisão da professora e verificar feedback de conflito sem perda do pedido, recarga e atualização das próximas aulas do aluno; documentar evidências de D4.

## 5. D5 — Integração e reavaliação

- [ ] 5.1 Executar percurso professora → dois alunos → professora com API/PostgreSQL reais de teste e identidade simulada em computador/celular; conferir isolamento, conflitos, conteúdo permitido, estados e regressões da demo.
- [ ] 5.2 Atualizar roadmap, evidências e lista de revisões pessoais opcionais com testes efetivamente executados; manter B4 real e 3E abertos e preparar o próximo passo sem criar contas ou enviar e-mails por inferência.
