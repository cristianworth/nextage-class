# Spec Delta

## Purpose

Preparar a execução hospedada do piloto preservando separação de ambientes, configuração e autorização.

## ADDED Requirements

### Requirement: Implantação configurada e restrita
O piloto hospedado SHALL receber configurações e segredos externamente, preservar o controle de acesso da API e usar HTTPS e rotas de aplicação e API coerentes. A demo pública SHALL continuar independente. A implantação SHALL ocorrer somente no ambiente e provedor escolhidos e autorizados.

#### Scenario: Configuração incompleta
- **WHEN** uma configuração obrigatória de operação não está disponível
- **THEN** o piloto falha de modo claro sem expor segredos nem apresentar conexão fictícia como funcional.

#### Scenario: Preparação não autoriza publicação
- **WHEN** o pacote e roteiro de implantação ficam prontos
- **THEN** não é publicada a aplicação nem alterado o banco hospedado sem autorização específica.

### Requirement: Prontidão para uso real
A liberação do piloto para dados reais SHALL depender de recuperação verificada, acesso real e recuperação de conta do B4, envio de e-mail operacional, configuração e isolamento conferidos, e decisões de operação registradas. Testes com identidade simulada SHALL não substituir essas evidências.

#### Scenario: Acesso real de aluno ainda não verificado
- **WHEN** a integração local passa mas o B4 real está pendente
- **THEN** o piloto permanece em preparação e não é declarado pronto para uso real.