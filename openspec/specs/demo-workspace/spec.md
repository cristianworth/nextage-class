# demo-workspace Specification

## Purpose

Oferecer uma demo local identificável e navegável, com dados fictícios preservados e recuperação explícita de problemas de armazenamento.

## Requirements

### Requirement: Navegação da demo
O sistema SHALL identificar o ambiente como demo fictícia local e permitir navegar entre agenda, alunos e histórico em computador e celular.

#### Scenario: Navegar sem login
- **WHEN** a pessoa abre a demo
- **THEN** ela acessa as três áreas sem autenticação e encontra a indicação de dados fictícios locais.

### Requirement: Persistência confiável
O sistema SHALL preservar alterações válidas após recarregar e informar falhas de leitura ou gravação sem sobrescrever dados inválidos silenciosamente nem apresentar uma gravação falha como salva.

#### Scenario: Recarregar uma alteração
- **WHEN** um aluno é salvo e a página é recarregada
- **THEN** aluno, aulas e registros salvos continuam disponíveis.

#### Scenario: Armazenamento corrompido
- **WHEN** os dados armazenados não podem ser interpretados ou têm versão incompatível
- **THEN** a interface informa o problema, preserva o valor armazenado e exige ação explícita para reiniciar.

#### Scenario: Falha de gravação
- **WHEN** o navegador recusa uma gravação
- **THEN** a interface informa a falha, mantém os dados anteriores e permite tentar novamente sem perder o formulário.

### Requirement: Reiniciar exemplos
O sistema SHALL permitir substituir os dados locais pelos exemplos fictícios somente após confirmação explícita.

#### Scenario: Cancelar o reset
- **WHEN** a pessoa cancela a confirmação de reinício
- **THEN** os dados atuais permanecem intactos.

#### Scenario: Confirmar o reset
- **WHEN** a pessoa confirma o reinício e a gravação é bem-sucedida
- **THEN** os exemplos substituem os dados locais e ficam disponíveis após recarregar.

### Requirement: Compatibilidade com a demo anterior
O sistema SHALL carregar os dados válidos do 1A preservando alunos, aulas e registros ao introduzir séries e bloqueios. Dados desconhecidos ou inválidos SHALL continuar protegidos contra sobrescrita silenciosa.

#### Scenario: Atualizar a demo com histórico
- **WHEN** a pessoa abre a nova versão com dados locais válidos do 1A
- **THEN** as aulas continuam pontuais, o histórico permanece intacto e novas séries podem ser salvas junto desses dados.

### Requirement: Compatibilidade pedagógica
O sistema SHALL acrescentar acervo e preparação preservando dados válidos do 1A/1B, incluindo séries, bloqueios, remarcações e registros. Migração SHALL ocorrer em memória e só persistir na próxima gravação válida; versões desconhecidas SHALL ser preservadas e recusadas.

#### Scenario: Atualizar uma agenda semanal
- **WHEN** dados válidos do 1B são carregados
- **THEN** a agenda e o histórico permanecem íntegros e os novos recursos podem ser salvos sem reiniciar a demo.

### Requirement: Navegação pedagógica
O sistema SHALL incluir o acervo na navegação existente e permitir completar preparação, registro e correção de homework em computador e celular, preservando formulários e dados anteriores em falha de gravação.

#### Scenario: Falha ao salvar material
- **WHEN** o armazenamento recusa a gravação de um material
- **THEN** o formulário mantém o texto digitado e o acervo anterior permanece intacto.

### Requirement: Migração sem inferir conclusão
O sistema SHALL carregar os dados válidos do 1C preservando materiais, planejamento, homework e histórico. Materiais antigos sem número SHALL permanecer complementares e registros antigos SHALL continuar sem conclusão presumida. Migração SHALL ocorrer em memória sem sobrescrever o armazenamento durante leitura.

#### Scenario: Atualizar acervo anterior
- **WHEN** uma demo v3 é carregada
- **THEN** seus dados continuam íntegros e a professora pode numerar materiais para organizar a sequência, sem reset.

### Requirement: Acrescentar exemplos preservando dados
O sistema SHALL permitir acrescentar materiais fictícios de demonstração ao acervo sem reiniciar alunos, agenda, histórico ou homework. Itens com ID, título/nível ou número/nível já presentes SHALL ser preservados sem duplicação. Falha de gravação SHALL manter o estado anterior.

#### Scenario: Demo migrada com acervo vazio
- **WHEN** a professora adiciona exemplos e repete a ação
- **THEN** o acervo recebe os itens ausentes uma vez e os dados anteriores permanecem intactos após recarregar.
