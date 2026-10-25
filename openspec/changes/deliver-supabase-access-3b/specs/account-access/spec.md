# Spec Delta

## Purpose

Identificar contas pelo Supabase Auth e restringir a API ao papel e vínculo autorizados no Nextage Class, preservando a demo fictícia independente.

## ADDED Requirements

### Requirement: Identidade verificável
A API SHALL validar assinatura, emissor, destinatário e validade do token do projeto configurado. Token ausente ou inválido SHALL ser recusado; dados de perfil enviados pelo navegador SHALL não substituir essa validação. Senhas SHALL não ser armazenadas pelo Nextage Class.

#### Scenario: Token de outro projeto ou expirado
- **WHEN** a chamada apresenta token assinado por outra chave, emitido por outro projeto, com destinatário incorreto ou expirado
- **THEN** a API responde acesso não autenticado, sem dados protegidos.

### Requirement: Papel e vínculo autorizados
Conta autenticada SHALL acessar somente recursos permitidos por um vínculo ativo mantido no servidor. Conta sem vínculo SHALL ser recusada. Metadados editáveis pelo usuário e identificadores enviados pelo cliente SHALL não conceder papel de professora ou acesso a outro aluno.

#### Scenario: Aluno informa papel de professora
- **WHEN** o aluno altera seus metadados para declarar papel de professora
- **THEN** o servidor mantém o papel e vínculo cadastrados e recusa operações da professora.

### Requirement: Sessão e configuração separadas da demo
O piloto SHALL oferecer entrada por e-mail/senha e saída com Supabase Auth, informando falhas sem expor credenciais. Sair SHALL retirar a consulta autenticada e limpar o contexto do usuário na interface. A demo fictícia SHALL continuar independente e nenhuma senha ou chave administrativa SHALL ser incorporada ao cliente.

#### Scenario: Sair e trocar conta
- **WHEN** a pessoa encerra uma sessão e entra com outra conta
- **THEN** os dados e formulários da conta anterior não permanecem no contexto autenticado.
