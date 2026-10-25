# Proposal

## Why

O aluno já consulta suas aulas e materiais, mas ainda não pode pedir horários. O 2C conecta os dois lados da demo sem substituir a decisão da professora nem expor a agenda de outras pessoas.

## What Changes

- Consultar horários livres para aula avulsa ou semanal, sem nomes ou motivos de ocupação.
- Enviar pedidos independentes e combinar vários horários semanais com avulsos. Avulsa é o padrão; término semanal é opcional.
- Acompanhar somente os próprios pedidos. Pendente não reserva horário.
- Professora aprova ou recusa individualmente. Aprovar verifica novamente disponibilidade e horário futuro, e cria uma aula ou série uma única vez.
- Preservar dados locais anteriores com migração em memória; simulação continua explícita, sem autenticação real.

## Capabilities

### New Capabilities
- `scheduling-requests`: disponibilidade pública, solicitação própria e decisão da professora.

### Modified Capabilities
- `demo-workspace`: compatibilidade dos dados locais ao acrescentar solicitações.

## Impact

Domínio, persistência, navegação e telas da demo React; testes e documentação. Sem dependências novas, backend, notificações ou ampliação de homework. Decisões sobre avulsas/semanais e aprovação obrigatória confirmadas por Cristian em 25/10/2026. Aprovação não configura reposição ou crédito.
