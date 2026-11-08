# Proposal

## Why

O piloto 3D foi verificado localmente com identidade simulada, mas ainda não possui operação hospedada e recuperação demonstrada para uso real. O 3E precisa transformar essa preparação em uma sequência verificável, preservando B4 e as decisões pendentes de Cristian.

## What Changes

- Preparar e verificar cópia e restauração em ambiente isolado com dados fictícios, definindo limites, integridade, destino e procedimento de recuperação antes de qualquer uso real.
- Planejar e validar configuração de implantação, disponibilidade, segredos, rede e migrações com ambientes separados; comparar opções antes de escolher hospedagem e não publicar por inferência.
- Alinhar B4: recuperação real e acesso de aluno com identidade e destinatário autorizados; conferir SMTP e configurações antes de qualquer envio externo.
- Corrigir o transbordamento relatado no histórico e revisar organização da navegação do piloto conforme a demo, em computador e celular.
- Registrar evidências, operação, limites, decisões abertas e critérios de liberação antes de dados reais; manter revisões pessoais opcionais separadas de validações reais necessárias.

## Capabilities

### New Capabilities

- `pilot-recovery`: cópia, restauração isolada e conferência de integridade dos dados do piloto.
- `pilot-deployment`: configuração e verificação da operação hospedada com ambientes e segredos separados.

### Modified Capabilities

- `lesson-history`: conteúdo longo legível dentro do histórico do piloto em computador e celular.

## Impact

Planejamento e documentação operacional; futuramente scripts e testes de banco, configuração da API e interface, navegação e histórico do piloto. Supabase Auth/PostgreSQL e provedor de hospedagem/e-mail exigem ações e autorizações específicas. O planejamento não contrata, envia mensagens, aplica migração hospedada nem publica o piloto.