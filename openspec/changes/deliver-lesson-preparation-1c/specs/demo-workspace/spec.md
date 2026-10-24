## ADDED Requirements

### Requirement: Compatibilidade pedagógica
O sistema SHALL acrescentar acervo e preparação preservando dados válidos do 1A/1B, incluindo séries, bloqueios, remarcações e registros. Migração SHALL ocorrer em memória e só persistir na próxima gravação válida; versões desconhecidas SHALL ser preservadas e recusadas.

#### Scenario: Atualizar uma agenda semanal
- **WHEN** dados válidos do 1B são carregados
- **THEN** a agenda e o histórico permanecem íntegros e os novos recursos podem ser salvos sem reiniciar a demo.

### Requirement: Navegação pedagógica
O sistema SHALL incluir o acervo na navegação existente e permitir completar preparação, registro e correção de homework em computador e celular, preservando formulários e dados anteriores em falha de gravação.

#### Scenario: Falha ao salvar material
- **WHEN** o armazenamento recusa a gravação de um material
- **THEN** o formulário mantém o texto digitado e o acervo anterior permanece intacto.
