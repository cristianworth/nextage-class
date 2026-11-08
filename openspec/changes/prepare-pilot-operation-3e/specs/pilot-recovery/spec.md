# Spec Delta

## Purpose

Permitir recuperar dados do piloto com um procedimento verificável e seguro para os ambientes existentes.

## ADDED Requirements

### Requirement: Cópia recuperável e restauração isolada
O procedimento SHALL gerar uma cópia consistente e SHALL permitir restaurá-la em destino isolado explicitamente identificado, sem substituir o banco de origem nem expor credenciais ou dados no repositório e nos logs. A integridade SHALL ser verificada com registros representativos e referências, não apenas com a existência do arquivo.

#### Scenario: Restauração de ensaio
- **WHEN** uma cópia de dados fictícios é restaurada em banco isolado
- **THEN** alunos, agenda, registros, pedidos e vínculos preservados são consultáveis e a origem permanece inalterada.

#### Scenario: Destino não identificado ou igual à origem
- **WHEN** o destino de restauração não pode ser identificado ou aponta para a origem
- **THEN** a operação é recusada antes de modificar dados.

### Requirement: Procedimento de recuperação operacional
Antes do uso real, SHALL existir um procedimento documentado de cópia, armazenamento, retenção, restauração, verificação e responsabilidade, com intervalo de perda aceitável e tempo de recuperação definidos para o piloto. A recuperação de identidades e configurações SHALL ser tratada separadamente da cópia do schema da aplicação.

#### Scenario: Cópia ausente ou inválida
- **WHEN** a cópia falha, está ausente ou não passa na conferência
- **THEN** a operação informa falha e não declara restauração bem-sucedida.