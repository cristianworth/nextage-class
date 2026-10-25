# Spec Delta

## Purpose

Vincular o acesso do aluno a um convite autorizado pela professora e permitir ativação e recuperação pelo Supabase Auth, sem cadastro público.

## ADDED Requirements

### Requirement: Convite vinculado a cadastro
Somente a professora SHALL convidar um aluno cadastrado por e-mail. O convite SHALL manter vínculo inequívoco com esse aluno, sem aceitar identificadores ou papéis escolhidos pelo convidado. Falha no provedor SHALL ser informada sem apresentar o envio como concluído. Convites reais SHALL depender de envio de e-mail configurado.

#### Scenario: Aluno tenta convidar outra pessoa
- **WHEN** uma conta de aluno chama a operação de convite
- **THEN** o acesso é negado e nenhum convite é enviado.

### Requirement: Ativação e recuperação gerenciadas
Ativação e recuperação de senha SHALL usar os mecanismos do Supabase Auth, com tratamento de links inválidos/expirados e sem expor tokens em logs ou manter um segundo cadastro de senhas. Solicitar recuperação SHALL não revelar se um e-mail pertence ao sistema.

#### Scenario: Link inválido e recuperação desconhecida
- **WHEN** a pessoa abre um link inválido ou solicita recuperação para endereço desconhecido
- **THEN** recebe orientação para tentar novamente, sem acesso indevido nem confirmação de existência de uma conta.

### Requirement: Entrada somente por convite
O cadastro público SHALL estar desabilitado no provedor antes do uso real. Ausência de botão de cadastro SHALL não ser considerada proteção suficiente. Operações administrativas e configurações secretas SHALL permanecer fora do cliente.

#### Scenario: Tentativa de cadastro direto
- **WHEN** uma pessoa não convidada tenta criar uma conta diretamente no serviço configurado
- **THEN** o cadastro público é recusado e não é criado vínculo de acesso no Nextage Class.
