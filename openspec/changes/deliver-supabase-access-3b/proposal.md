# Proposal

## Why

O servidor já acessa PostgreSQL, mas ainda não identifica quem chama a API. Cristian escolheu Supabase Auth para reduzir a implementação de credenciais e começar no plano gratuito, preservando as regras e permissões no C#.

## What Changes

- Validar a identidade Supabase na API e consultar papel/vínculo próprios do sistema, recusando usuários sem acesso ativo.
- Vincular convite da professora a um cadastro de aluno; cadastro público não fará parte do fluxo.
- Implementar entrada, ativação por convite, recuperação e saída com Supabase Auth, sem armazenar outra senha no backend.
- Separar configuração pública e administrativa; preparar esquema restrito e testar acessos negados.
- Preservar demo local e distinguir testes locais de verificação real no projeto gratuito criado em São Paulo.

## Capabilities

### New Capabilities
- `account-access`: identidade validada e acesso restrito por vínculo/papel.
- `student-invitations`: convite da professora, ativação e recuperação de conta.

### Modified Capabilities
Nenhuma regra da demo é substituída. A integração autenticada adiciona uma fronteira de acesso real.

## Impact

API C#, interface React, schema/migrações, configuração e testes. Usar Supabase Auth, sem ASP.NET Core Identity e sem cadastro paralelo de senhas. Provedor de e-mail/implantação e uso real dependem de verificação operacional; não enviar mensagens para pessoas não autorizadas.
