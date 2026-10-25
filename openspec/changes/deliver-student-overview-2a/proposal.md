# Proposal

## Why

A etapa 1 validou a rotina da professora. O 2A inicia a demo do aluno por consulta das próprias aulas, material utilizado e homework, antes do acervo completo ou de solicitações que alteram a agenda.

## What Changes

- Entrada explícita de simulação de aluno, com retorno à professora e seleção de perfil fictício em ferramentas da demo.
- Próximas aulas pontuais, semanais e remarcadas, com horários de Brasília e link próprio.
- Histórico próprio com material e homework somente em leitura. Cristian confirmou que conteúdo/observações livres não serão compartilhados agora.
- Contrato de consulta com campos explícitos, excluindo dados desnecessários, planejamento e motivo de falta.
- Roadmap e chunks atualizados. Dispensas individuais e vários materiais por encontro ficam como possibilidades sem prioridade atual.

## Capabilities

### New Capabilities

- `student-overview`: consulta simulada das próprias aulas, histórico e homework, sem alterações pelo aluno.

### Modified Capabilities

Nenhuma. A rotina da professora continua disponível; acesso e identidade reais pertencem à etapa com servidor.

## Impact

Composição da aplicação, consulta de domínio e interface dedicada do aluno. Reutilizar contratos de agenda e persistência existentes. Sem novo formato local, dependências, APIs, correção de homework pelo aluno, acervo completo ou solicitações de horário.
