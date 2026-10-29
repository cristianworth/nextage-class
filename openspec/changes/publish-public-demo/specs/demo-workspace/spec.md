# Spec Delta

## ADDED Requirements

### Requirement: Demonstração pública independente
A demo pública SHALL oferecer os fluxos demonstrativos de professora, aluno e decisão sem login, API ou conexão operacional ao Supabase. A interface SHALL identificar dados fictícios e a alternância como simulação.

#### Scenario: Primeira visita pública
- **WHEN** a pessoa abre o endereço HTTPS publicado sem conta
- **THEN** ela consulta a agenda e alterna para a simulação do aluno sem acessar serviços operacionais.

### Requirement: Exemplos públicos úteis e restauráveis
A demo pública SHALL iniciar com exemplos de aulas passadas e futuras, continuidade pedagógica, preparação, homework e solicitação pendente. As datas SHALL ser relativas à criação ou restauração explícita, preservando a coerência do histórico. Recarregar SHALL preservar exemplos e alterações salvos.

#### Scenario: Visita no fim de semana
- **WHEN** a pessoa abre a demo pela primeira vez no fim de semana
- **THEN** encontra agenda preenchida, próximas aulas e histórico permitido, com data dos exemplos visível e orientação para restaurar.

#### Scenario: Restaurar após edição
- **WHEN** a pessoa confirma a restauração dos exemplos
- **THEN** os exemplos são recriados com datas atuais e persistem após recarga; cancelar ou falhar a gravação preserva os dados anteriores.

### Requirement: Armazenamento público separado
A demo pública SHALL usar armazenamento distinto da demo local anterior e do piloto. Dados anteriores ou inválidos SHALL não ser sobrescritos silenciosamente. Falhas de persistência SHALL ser informadas sem falso sucesso e preservando formulários quando houver edição.

#### Scenario: Dados locais anteriores presentes
- **WHEN** a pessoa abre, edita ou restaura a demo pública com dados da demo anterior no mesmo navegador
- **THEN** o armazenamento anterior permanece intacto e os exemplos públicos mantêm suas próprias alterações.

### Requirement: Roteiro e publicação navegáveis
A demo pública SHALL oferecer um roteiro opcional de três ações e permitir professora, simulação do aluno e retorno à decisão. Assets, fontes, favicon e recarga SHALL funcionar no subdiretório público em computador e celular.

#### Scenario: Recarga no endereço publicado
- **WHEN** a pessoa recarrega o endereço da demo após registrar aula ou decidir um pedido
- **THEN** os dados salvos continuam acessíveis e marca, navegação e fontes carregam pelo mesmo subdiretório.
