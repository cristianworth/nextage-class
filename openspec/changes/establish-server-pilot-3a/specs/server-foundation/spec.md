# Spec Delta

## Purpose

Oferecer uma base executável para o piloto com servidor e banco PostgreSQL, permitindo verificar disponibilidade sem expor configuração ou dados privados.

## ADDED Requirements

### Requirement: Servidor configurado externamente
O servidor SHALL receber a conexão PostgreSQL por configuração externa, sem credenciais no código ou repositório. A ausência de configuração SHALL produzir erro de inicialização claro, sem mostrar valores secretos. A demo local existente SHALL continuar independente do servidor.

#### Scenario: Iniciar sem conexão configurada
- **WHEN** a conexão obrigatória não está configurada
- **THEN** o servidor não inicia com configuração fictícia silenciosa e informa qual configuração está ausente.

### Requirement: Processo e prontidão separados
O servidor SHALL oferecer verificações separadas de processo ativo e acesso ao banco. Prontidão SHALL consultar o banco real e responder indisponível quando a conexão falhar. Respostas públicas SHALL não incluir nomes de banco, usuário, senha, endereços internos ou mensagens de exceção, e SHALL não ser armazenadas em cache.

#### Scenario: Banco disponível e indisponível
- **WHEN** o processo está ativo e o banco fica indisponível
- **THEN** a verificação do processo continua respondendo sucesso e a prontidão responde indisponível, sem detalhes privados.
