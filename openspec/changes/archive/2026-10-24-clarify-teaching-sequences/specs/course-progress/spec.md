## ADDED Requirements

### Requirement: Percurso flexível sem conclusão presumida
O sistema SHALL permitir selecionar uma unidade fora da ordem sugerida. A continuidade SHALL usar o resultado da unidade efetivamente trabalhada, sem registrar conclusão ou remover unidades omitidas. Uma unidade anterior SHALL continuar selecionável para retomada.

#### Scenario: Omitir gramática e retomar depois
- **WHEN** a professora seleciona Unidade 3 de conversação sem trabalhar Unidade 2 de gramática
- **THEN** o registro e a continuidade usam a Unidade 3 e a Unidade 2 permanece no acervo sem conclusão presumida, podendo ser selecionada depois.
