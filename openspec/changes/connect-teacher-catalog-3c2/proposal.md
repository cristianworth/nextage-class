# Proposal

## Why

Cristian aprovou o cadastro conectado e autorizou avançar ao acervo em 04/11/2026. A demo já mantém sequências, unidades, apoios e vínculo principal; o piloto ainda não persiste esses dados no servidor.

## What Changes

- Persistir sequências e materiais em migração nova, sem reescrever migrações aplicadas.
- Oferecer leitura, criação e edição restritas à professora, com validação no servidor e número de unidade único por sequência.
- Conectar os formulários e a consulta do acervo existentes ao piloto e permitir sequência principal no cadastro.
- Preservar vínculo incompatível após mudança de nível, permitir troca/remoção explícita e preservar campos de acesso.
- Verificar API/PostgreSQL, navegador conectado, permissões, recarga, erros e regressões da demo.

## Capabilities

### New Capabilities

- `connected-teacher-catalog`: acervo e vínculo principal persistidos e autorizados no servidor.

### Modified Capabilities

Nenhuma mudança nas regras da demo. O servidor implementa os contratos de book-catalog/material-library já entregues.

## Impact

Migração 003, rotas C#, modelos de cadastro, formulários compartilhados assíncronos, navegação e acervo no piloto. Sem importação da demo, contas novas, convites, agenda, registros ou portal do aluno. Históricos no servidor entram no 3C4; não criar snapshots vazios antecipadamente.
