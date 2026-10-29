# Spec Delta

## Purpose

Permitir que a professora mantenha o cadastro de alunos pelo servidor, preservando vínculos de acesso e os dados já confirmados diante de erros.

## ADDED Requirements

### Requirement: Cadastro editável restrito à professora
O servidor SHALL permitir cadastrar, listar e editar alunos somente por uma identidade com vínculo teacher ativo. Valores inválidos SHALL ser recusados sem alterar os dados anteriores; editar um ID inexistente SHALL retornar não encontrado.

#### Scenario: Aluno tenta editar
- **WHEN** uma conta de aluno tenta editar um cadastro
- **THEN** o servidor nega o acesso e preserva o cadastro.

#### Scenario: Correção inválida
- **WHEN** a professora envia nome, nível ou link inválidos
- **THEN** recebe erro de validação e o cadastro anterior permanece íntegro.

### Requirement: Preservar identidade e acesso na edição
Editar o cadastro SHALL preservar identificador, data de criação, convite e papel/vínculo de acesso. O nome exibido do perfil de aluno vinculado SHALL acompanhar a alteração confirmada do nome sem promover permissões ou alterar credenciais.

#### Scenario: Renomear aluno convidado
- **WHEN** a professora altera o nome de um aluno com convite e perfil vinculados
- **THEN** a sessão seguinte usa o nome atualizado e mantém o mesmo aluno, identidade e papel.

### Requirement: Formulário conectado resiliente
O piloto SHALL oferecer edição pelo formulário existente, atualizar a lista somente após confirmação do servidor e manter os dados digitados quando a gravação falhar. Os dados confirmados SHALL persistir após recarga sem usar o armazenamento da demo como fonte.

#### Scenario: Falha e nova tentativa
- **WHEN** a API recusa a gravação e a professora tenta novamente
- **THEN** o formulário preserva o texto e a alteração só aparece como salva após resposta bem-sucedida.
