# Spec Delta

## Purpose

Conectar o acervo da professora e a sequência principal do aluno ao servidor sem alterar os limites da demo ou antecipar o portal do aluno.

## ADDED Requirements

### Requirement: Acervo persistido e restrito

O servidor SHALL permitir listar, criar e editar sequências, unidades e apoios somente por perfil teacher ativo. Títulos, níveis e conteúdo SHALL ser validados. Identificadores e criação SHALL ser preservados na edição; atualização SHALL ser indicada. Conteúdo SHALL ser apresentado como texto literal.

#### Scenario: Salvar e recarregar
- **WHEN** a professora salva uma sequência e material válidos e recarrega o piloto
- **THEN** recebe os mesmos dados persistidos pela API, sem depender do localStorage da demo.

#### Scenario: Acesso de aluno
- **WHEN** uma identidade de aluno tenta ler ou alterar o acervo administrativo
- **THEN** a API nega o acesso sem modificar os dados.

### Requirement: Unidade única e compatibilidade herdada

Uma unidade SHALL exigir sequência e número positivo até 9999. O número SHALL ser único na sequência inclusive sob concorrência, aceitando o mesmo número em outras sequências. Seus níveis SHALL vir da sequência atual; apoios SHALL manter níveis próprios e nenhum número. A consulta SHALL ordenar unidades numericamente e permitir busca e filtro por nível.

#### Scenario: Número concorrente
- **WHEN** dois pedidos tentam criar a mesma Unidade 2 na mesma sequência
- **THEN** apenas um é salvo e o outro recebe conflito compreensível.

#### Scenario: Evoluir níveis da sequência
- **WHEN** a professora altera os níveis atendidos de uma sequência
- **THEN** suas unidades passam a refletir esses níveis sem alterar conteúdo ou data de criação.

### Requirement: Vínculo principal sem perda implícita

O cadastro SHALL permitir sequência principal compatível ou nenhuma, na mesma transação dos demais campos. Omissão do campo SHALL preservar o vínculo existente; remoção SHALL ser explícita. Mudança de nível que torne o vínculo atual incompatível SHALL mantê-lo indicado, sem apagar identidade, acesso ou convites.

#### Scenario: Mudar nível
- **WHEN** o aluno muda de A1 para B1 e sua sequência atual atende somente A1
- **THEN** o vínculo permanece indicado como incompatível até troca ou remoção explícita.

### Requirement: Gravação assíncrona revisável

O piloto SHALL reutilizar os formulários do acervo, aguardar confirmação do servidor e preservar os valores em erro. SHALL impedir duplo envio enquanto salva e descartar contexto na troca de conta. Exemplos da demo SHALL permanecer separados do cadastro conectado.

#### Scenario: Corrigir unidade duplicada
- **WHEN** o servidor recusa número já utilizado e a professora informa outro número
- **THEN** o formulário mantém os demais campos e só fecha após gravação confirmada.
