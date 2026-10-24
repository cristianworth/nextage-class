## ADDED Requirements

### Requirement: Acrescentar exemplos preservando dados
O sistema SHALL permitir acrescentar materiais fictícios de demonstração ao acervo sem reiniciar alunos, agenda, histórico ou homework. Itens com ID, título/nível ou número/nível já presentes SHALL ser preservados sem duplicação. Falha de gravação SHALL manter o estado anterior.

#### Scenario: Demo migrada com acervo vazio
- **WHEN** a professora adiciona exemplos e repete a ação
- **THEN** o acervo recebe os itens ausentes uma vez e os dados anteriores permanecem intactos após recarregar.
