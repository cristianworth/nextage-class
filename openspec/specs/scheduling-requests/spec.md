# scheduling-requests Specification

## Purpose

Permitir ao aluno solicitar horários livres e acompanhar a decisão individual da professora, preservando a disponibilidade e a privacidade da agenda.

## Requirements

### Requirement: Disponibilidade sem detalhes privados
O aluno SHALL consultar horários futuros livres de segunda a sexta, das 07h às 22h no fuso de Brasília, para aula avulsa ou semanal. A consulta SHALL considerar aulas, remarcações e bloqueios em todo o período semanal solicitado, sem nomes, motivos de bloqueio ou outros dados privados.

#### Scenario: Conflito distante no horário semanal
- **WHEN** um horário está livre na primeira data, mas ocupado meses depois dentro do período solicitado
- **THEN** ele não aparece como disponível para o pedido semanal; a avulsa continua disponível se não houver conflito naquela data.

### Requirement: Pedidos independentes sem reserva
O aluno SHALL enviar pedidos avulsos ou semanais independentes e combináveis, com avulsa como padrão e término semanal opcional. Pendente SHALL não reservar horário nem alterar a agenda. O sistema SHALL recusar horários iniciados, inválidos, indisponíveis e pedidos pendentes idênticos do mesmo aluno.

#### Scenario: Combinar dias e modalidades
- **WHEN** o aluno pede segunda e terça às 10h semanalmente, quarta às 11h semanalmente e uma sexta avulsa
- **THEN** quatro pedidos independentes aguardam decisão e nenhum encontro é criado ainda.

#### Scenario: Dois alunos pedem o mesmo horário
- **WHEN** dois alunos enviam pedidos para um horário livre
- **THEN** ambos podem ficar pendentes; um pedido não bloqueia o outro.

### Requirement: Decisão individual com nova verificação
A professora SHALL aprovar ou recusar cada pedido pendente. Aprovar SHALL conferir novamente horário futuro e disponibilidade, criando uma única aula ou série com o aluno solicitado. Conflito ou falha de gravação SHALL preservar agenda e pedido pendente. Pedidos decididos SHALL não aceitar nova decisão.

#### Scenario: Horário ocupado depois do pedido
- **WHEN** a professora tenta aprovar após agendar outra aula ou bloqueio naquele horário
- **THEN** um conflito é informado e o pedido permanece pendente, sem nova aula.

#### Scenario: Recusar e repetir decisão
- **WHEN** a professora recusa um pedido e tenta decidi-lo novamente
- **THEN** a recusa permanece registrada e nenhuma aula é criada.

### Requirement: Acompanhamento próprio e persistente
O aluno SHALL consultar somente os próprios pedidos com modalidade, data, horário, período e situação pendente/aprovado/recusado. A decisão SHALL permanecer após recarga. Trocar o perfil da simulação SHALL descartar o formulário anterior; aprovação SHALL refletir nas próximas aulas. Campos reservados à professora SHALL continuar excluídos.

#### Scenario: Trocar perfil e consultar decisão
- **WHEN** um pedido foi aprovado e a pessoa troca de aluno e retorna ao solicitante
- **THEN** somente o solicitante vê esse pedido e suas aulas confirmadas, sem formulário ou pedidos do outro aluno.
