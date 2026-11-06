## ADDED Requirements

### Requirement: Pedido autenticado e próprio
O piloto SHALL vincular cada pedido ao aluno da sessão ativa, persistir sua decisão e permitir ao aluno consultar somente seus pedidos. Pedidos pendentes SHALL continuar independentes e não reservar horário.

#### Scenario: Identidade adulterada
- **WHEN** o cliente tenta enviar ou consultar um pedido em nome de outro aluno
- **THEN** o sistema não cria pedido para o outro aluno nem revela seus pedidos.

#### Scenario: Dois alunos pedem o mesmo horário
- **WHEN** dois alunos solicitam o mesmo horário disponível
- **THEN** ambos podem ter pedidos pendentes sem alterar ou reservar a agenda.

### Requirement: Decisão persistida com agenda consistente
A aprovação SHALL revalidar a disponibilidade de todo o período e gravar decisão e aula ou série em uma operação atômica. Apenas a professora ativa SHALL decidir; decisões repetidas SHALL não criar novos encontros.

#### Scenario: Aprovações concorrentes em conflito
- **WHEN** duas aprovações concorrentes disputam o mesmo horário
- **THEN** no máximo uma cria o encontro e a outra informa conflito sem alterar seu pedido pendente.

#### Scenario: Alteração concorrente da agenda
- **WHEN** uma aula ou bloqueio ocupa o horário antes da aprovação
- **THEN** a aprovação falha integralmente, mantendo pedido pendente e agenda sem nova aula.

### Requirement: Disponibilidade autenticada sem detalhes privados
A consulta de disponibilidade SHALL considerar toda a duração de pedidos semanais e revelar apenas horários disponíveis, sem identificar ocupantes, bloqueios ou dados reservados.

#### Scenario: Conflito futuro distante
- **WHEN** uma ocorrência futura da repetição conflita com a agenda
- **THEN** o horário semanal não é oferecido para o período solicitado, sem expor a causa privada.
