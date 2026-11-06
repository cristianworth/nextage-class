## ADDED Requirements

### Requirement: Acervo autorizado pela identidade
O piloto SHALL fornecer somente o acervo compatível com o nível atual do aluno vinculado à sessão e sua continuidade própria, preservando as regras de consulta e estados da demo. A leitura SHALL não alterar progresso ou homework.

#### Scenario: Mudança de nível e cópia histórica
- **WHEN** o nível atual muda e um material antigo permanece no histórico
- **THEN** o acervo mostra somente conteúdo compatível com o nível atual e o histórico mantém a cópia compartilhada da aula.

#### Scenario: Tentativa de consultar outro aluno
- **WHEN** o cliente tenta escolher um aluno diferente do vínculo autenticado
- **THEN** não recebe acervo ou continuidade calculados para esse outro aluno.
