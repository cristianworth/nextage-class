## ADDED Requirements

### Requirement: Migrar acervo para livros
O sistema SHALL carregar dados válidos v1–v4 e migrar em memória para o acervo com livros. Unidades numeradas anteriores SHALL formar uma sequência por nível; apoios SHALL permanecer independentes. Migração SHALL preservar IDs, conteúdo, progresso, planos, agenda e homework, sem gravar durante leitura.

#### Scenario: Atualizar demo com progresso
- **WHEN** uma demo v4 possui unidade em andamento e homework corrigido
- **THEN** a unidade integra o livro do nível, o aluno retoma o progresso e o homework permanece corrigido após a próxima gravação válida e recarga.

#### Scenario: Dados inválidos
- **WHEN** o armazenamento tem referências inválidas ou versão desconhecida
- **THEN** a aplicação preserva o valor original e informa a falha sem reset automático.
