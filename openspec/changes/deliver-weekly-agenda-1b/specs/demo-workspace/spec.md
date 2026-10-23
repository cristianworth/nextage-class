## ADDED Requirements

### Requirement: Compatibilidade com a demo anterior
O sistema SHALL carregar os dados válidos do 1A preservando alunos, aulas e registros ao introduzir séries e bloqueios. Dados desconhecidos ou inválidos SHALL continuar protegidos contra sobrescrita silenciosa.

#### Scenario: Atualizar a demo com histórico
- **WHEN** a pessoa abre a nova versão com dados locais válidos do 1A
- **THEN** as aulas continuam pontuais, o histórico permanece intacto e novas séries podem ser salvas junto desses dados.
