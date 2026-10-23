# Proposal

## Why

A base atual é exclusivamente documental. O incremento 1A precisa transformar as decisões validadas em um primeiro fluxo demonstrável de aluno, aula pontual, registro e histórico, com persistência local e conteúdo fictício.

## What Changes

- Criar interface React/TypeScript com agenda semanal/dia, alunos e histórico.
- Persistir a demo localmente, tratar dados inválidos/falhas de gravação e permitir reset confirmado.
- Cadastrar/editar aluno com nome e nível obrigatórios e dados complementares opcionais.
- Agendar aulas individuais pontuais na grade validada, recusando conflitos.
- Registrar e editar o resultado de aulas ocorridas, mantendo um registro por aula e contexto histórico.
- Verificar o fluxo completo e documentar execução e limitações.

## Capabilities

### New Capabilities

- `demo-workspace`: navegação e persistência/reset da demo fictícia.
- `student-management`: cadastro, edição e pesquisa de alunos.
- `lesson-scheduling`: aulas pontuais na grade e prevenção de conflitos.
- `lesson-history`: lançamento, edição e consulta dos registros de aulas.

### Modified Capabilities

Nenhuma: não há especificações de comportamento implementado.

## Impact

Novo aplicativo em `web/`, dependências e comandos de desenvolvimento, testes e documentação. Sem backend, login, serviços externos, recorrência, remarcação, homework ou acervo completo. A implementação segue os blocos A1–A6 de `docs/delivery-chunks.md`. O uso real com alunos continua reservado à fase com servidor.
