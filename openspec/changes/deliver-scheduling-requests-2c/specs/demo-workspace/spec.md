# Spec Delta

## ADDED Requirements

### Requirement: Compatibilidade ao acrescentar solicitações
O sistema SHALL carregar dados válidos v1–v5 e acrescentar solicitações vazias em memória, preservando os dados anteriores. Ler SHALL não gravar a migração. Pedidos válidos SHALL persistir junto da agenda na próxima gravação bem-sucedida. Referências inconsistentes ou versões desconhecidas SHALL ser recusadas sem sobrescrever o valor original.

#### Scenario: Atualizar demo com acervo e histórico
- **WHEN** uma demo v5 é carregada
- **THEN** todos os dados anteriores permanecem iguais e solicitações começam vazias, sem reset ou gravação durante leitura.

#### Scenario: Falha ao aprovar
- **WHEN** o navegador recusa a gravação da aprovação
- **THEN** pedido e agenda anteriores permanecem intactos, o erro é visível e a professora pode tentar novamente.
