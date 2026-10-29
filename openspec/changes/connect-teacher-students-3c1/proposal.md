# Proposal

## Why

Cristian validou o acesso da professora e pediu o próximo recorte do roadmap. O piloto cadastra alunos, mas não permite corrigir seus dados. A demo já oferece formulário e comportamento de edição; serve como referência sem importar seu armazenamento.

## What Changes

- Permitir à professora editar o cadastro pela API e pelo formulário compartilhado.
- Preservar ID, criação, convites e vínculo de acesso; manter o nome exibido da conta vinculada coerente.
- Conferir validação, acessos negados, persistência e formulário em erro.
- Registrar acesso da professora validado e dividir 3C em recortes; B4 continua aberto para recuperação/aluno.

## Capabilities

### New Capabilities

- `connected-student-management`: cadastro e edição persistidos pelo servidor e autorizados à professora.

### Modified Capabilities

Nenhuma regra da demo é alterada.

## Impact

Rotas C#, StudentStore, cliente do piloto e tela existente de alunos. Sem migração, senhas, contas novas ou importação de dados. A versão de linguagem e os contratos existentes são preservados.
