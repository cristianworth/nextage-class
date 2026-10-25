# Verificação do 2C — Solicitações de horário

Mudança `deliver-scheduling-requests-2c`, em 25/10/2026. Regras aprovadas por Cristian: avulsas e vários horários semanais combináveis; cada pedido precisa de aprovação e pendente não reserva. Revisão de uso com Cristian/Nara permanece no 2D.

## Resultado e chunks

| Chunk | Entrega |
| --- | --- |
| C1 | Disponibilidade pública, pedidos independentes, decisão única, migração local v6 |
| C2 | Formulário avulso/semanal e acompanhamento somente dos pedidos próprios |
| C3 | Pendências da professora, filtros e aprovação/recusa com conferência de conflitos |
| C4 | Verificação integrada e visual de computador/celular, requisitos sincronizados e documentação atualizada |

## Para testar

1. Recarregar `http://127.0.0.1:5173/` e abrir **Ver como aluno → Solicitações**.
2. Escolher uma data futura de segunda a sexta e enviar aula avulsa em um horário disponível. Conferir a confirmação e o pedido **Pendente**; Minhas aulas ainda não deve ganhar esse encontro.
3. Escolher **Horário semanal**, definir a primeira aula e deixar o término vazio ou preencher uma data. Enviar segunda/terça no mesmo horário e quarta em outro, como pedidos separados. Pode combinar com avulsas.
4. Trocar o aluno fictício: os pedidos e formulário anteriores não acompanham o outro perfil. Outro aluno pode pedir o mesmo horário enquanto ele estiver apenas pendente.
5. **Voltar à professora → Solicitações**. Aprovar um pedido e recusar outro. Usar o filtro para consultar as decisões; não há segunda aprovação de um pedido decidido.
6. Voltar ao solicitante: as decisões aparecem em Solicitações e os encontros aprovados em Minhas aulas. Recarregar preserva ambos.
7. Para experimentar conflito posterior, enviar dois pedidos para o mesmo horário, por alunos diferentes; aprovar o primeiro e tentar aprovar o segundo. O segundo deve continuar pendente, sem aula extra. Pode ser recusado.
8. No celular, percorrer formulário, pedidos e decisão; os controles devem permanecer acessíveis sem largura excedente.

## Evidências técnicas

Os sete novos cenários de navegador verificam combinação semanal/avulsa, ausência de reserva, consulta própria, aprovação, recusa, conflito posterior, duplicidade, início passado, períodos inválidos, conflito distante, recarga e migração v5. Erros de gravação preservam formulário, pendência e agenda sem falso sucesso. Testes de domínio/persistência também cobrem bloqueios, remarcações, término inclusivo, aprovação única, v1–v5 e dados inválidos.

- **109 testes de domínio/persistência aprovados** em treze arquivos (oito novos neste recorte).
- **48 cenários de navegador aprovados**, incluindo os sete novos e todas as 41 regressões.
- Build/TypeScript, formatação e validação estrita OpenSpec aprovados.
- Conferidas telas da professora e do aluno em computador e celular 390 × 844; navegação e formulário sem transbordamento. Asteriscos permanecem ao lado do nome do campo.
- Testes usam contextos isolados na porta 4177. O armazenamento da prévia manual não foi reiniciado nem alterado. Resultados e imagens locais ficam fora do Git.
- Documentos e requisitos atuais sincronizados; mudança permanece aberta para a revisão integrada de uso no 2D, sem presumir aceite humano.

## Limites

Um envio por horário, com decisão individual; sem seleção em lote, retirada pelo aluno, edição de pedido decidido ou justificativa livre. Solicitação aprovada preserva o combinado original; remarcações posteriores são consultadas em Minhas aulas. Horário iniciado não é aprovado nem deslocado automaticamente.

As ferramentas de perfil são uma simulação local explícita. Não existe autenticação, sincronização entre dispositivos/abas ou concorrência real. A etapa 3 deverá impor identidade, autorização e consistência no servidor. Homework, progresso e conteúdo compartilhado seguem inalterados.
