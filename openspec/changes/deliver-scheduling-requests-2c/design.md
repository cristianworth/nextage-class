# Design

## Context

Ver proposal.md. A agenda já tem operações públicas de agendamento pontual/semanal e detecção de conflito sem horizonte artificial. A consulta do aluno recebe modelos explícitos; a simulação controla seleção de perfil fora da tela do aluno. Persistência valida todo o documento antes de substituir o estado React.

## Goals / Non-Goals

Manter as regras de disponibilidade em um único módulo e reutilizar as operações de agendamento na aprovação. Não introduzir servidor, autenticação, calendário público com nomes, notificações, pacote indivisível de horários ou edição de pedidos decididos.

## Decisions

- Um pedido representa um horário avulso ou uma série semanal. Enviar outro permite combinar segunda/terça no mesmo horário e quarta em outro, inclusive avulsas. Não criar entidade de pacote sem necessidade.
- Acrescentar consulta pública de horas livres ao módulo de disponibilidade: construir ocupações uma vez por consulta e comparar o candidato com cada regra, sem expor rótulos privados. Recorrências usam o período inteiro, inclusive conflitos distantes e exceções de remarcação.
- Comandos de solicitação recebem o aluno selecionado pelo controlador da simulação; a tela recebe apenas horas livres, seus pedidos e callbacks restritos. Erros de disponibilidade ao solicitar são genéricos. Aprovação usa os comandos públicos existentes e permite detalhes de conflito somente à professora.
- Pedido pendente contém modalidade, data/hora e término; decisão grava situação, horário da decisão e identificador da aula/série criada. Recusa não altera agenda. Uma decisão já feita é recusada, evitando aulas duplicadas.
- Versão local v6 acrescenta requests. Validador v5 preservado para migração v1–v5; upgrade em memória. Guardar criação e aprovação em uma única gravação válida mantém atomicidade em falha de quota.
- Acrescentar Solicitações à navegação de ambos os lados, com pendências identificáveis. Quatro abas do aluno em duas colunas no celular; navegação da professora ajustada para cinco destinos sem rolagem lateral da página.
- Horário iniciado não pode ser solicitado/aprovado. Pedido que envelhece continua pendente, com aviso para novo pedido; pode ser recusado. Sem inventar expiração automática ou deslocar o início semanal silenciosamente.

## Risks / Trade-offs

- Simulação local não protege dados contra acesso pelo navegador → continuar explicitando esse limite; identidade e concorrência reais pertencem à etapa 3.
- Horário pode deixar de estar livre entre pedido e decisão → revalidar na aprovação e preservar pendência em conflito.
- Vários dias exigem vários envios → manter formulário na aba, com confirmação e lista de pedidos; reavaliar seleção em lote apenas se o uso justificar.
- Solicitação aprovada é o registro da decisão original; remarcações posteriores continuam consultadas em Minhas aulas, sem reescrever o pedido original.

## Migration Plan

Validar v1–v5 pelos contratos existentes, migrar acervo quando necessário, então acrescentar requests vazio e versão 6. Sem gravação automática. Testar rejeição de dados inválidos, falhas de armazenamento e recarga antes de registrar a entrega. Rollback de código exige preservar o documento v6, que versões antigas não sabem ler; não rebaixar nem apagar dados silenciosamente.
