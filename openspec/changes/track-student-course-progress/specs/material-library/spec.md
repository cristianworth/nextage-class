## ADDED Requirements

### Requirement: Ordem das aulas do material
O sistema SHALL permitir informar um número inteiro positivo para ordenar aulas do material dentro do nível, impedindo números duplicados no mesmo nível. Material sem número SHALL continuar disponível como complementar. Ordenação SHALL ser numérica e alterações SHALL preservar cópias históricas.

#### Scenario: Organizar sequência
- **WHEN** o acervo contém A1 Aula 2 e Aula 10
- **THEN** a Aula 2 aparece antes da Aula 10; outra A1 Aula 2 é recusada, mas A2 Aula 2 é permitida.
