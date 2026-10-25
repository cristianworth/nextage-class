## ADDED Requirements

### Requirement: Migração sem inferir conclusão
O sistema SHALL carregar os dados válidos do 1C preservando materiais, planejamento, homework e histórico. Materiais antigos sem número SHALL permanecer complementares e registros antigos SHALL continuar sem conclusão presumida. Migração SHALL ocorrer em memória sem sobrescrever o armazenamento durante leitura.

#### Scenario: Atualizar acervo anterior
- **WHEN** uma demo v3 é carregada
- **THEN** seus dados continuam íntegros e a professora pode numerar materiais para organizar a sequência, sem reset.
