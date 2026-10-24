## ADDED Requirements

### Requirement: Identificação de unidades
O sistema SHALL exibir unidades numeradas como Unidade N — Descrição e manter a ordenação numérica independente do título. Materiais sem número SHALL continuar complementares; nomes e textos históricos livres SHALL ser preservados.

#### Scenario: Ordem numérica
- **WHEN** o seletor oferece unidades 2 e 10
- **THEN** Unidade 2 aparece antes de Unidade 10, ainda que a ordem alfabética das descrições seja diferente.
