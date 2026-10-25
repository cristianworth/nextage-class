# Proposal

## Why

O 1A atende aulas pontuais. O 1B precisa representar a rotina semanal sem cadastrar cada ocorrência manualmente, permitindo bloquear disponibilidade e trocar horários sem criar reposições ou alterar o passado.

## What Changes

- Criar horários fixos semanais, sem término ou com data final informada.
- Mostrar ocorrências em qualquer semana, sem duplicar ou gerar uma lista infinita no armazenamento.
- Criar/remover bloqueios pontuais ou semanais, inclusive intervalos de várias horas.
- Remarcar uma aula ou esta e as próximas, com padrão individual; mudanças da série substituem também trocas pontuais futuras.
- Verificar conflitos em toda a validade dos horários, inclusive além da semana visível; uma falha mantém todo o estado anterior.
- Migrar dados locais do 1A preservando alunos, aulas e registros.
- Ajustar o cadastro: obrigatórios com asterisco vermelho, sem rótulos “Opcional”.

## Capabilities

### New Capabilities

- `weekly-scheduling`: séries semanais e identidade estável das ocorrências.
- `availability-blocking`: bloqueios pontuais/semanais e remoção explícita.
- `lesson-rescheduling`: remarcação individual ou futura com preservação de histórico.

### Modified Capabilities

- `lesson-scheduling`: considerar séries e bloqueios em agendamento/consulta.
- `demo-workspace`: leitura compatível com os dados locais anteriores.
- `student-management`: indicação visual dos campos obrigatórios.

## Impact

Modelos, operações e consulta de agenda, formulários, armazenamento, testes e documentação. Sem novas dependências, backend, reposição, homework, catálogo ou feriados automáticos. Cristian confirmou término opcional, substituição de remarcações futuras e bloqueio que apenas avisa conflito.
