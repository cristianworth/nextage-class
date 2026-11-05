# Agenda da professora no servidor

Cristian autorizou seguir ao 3C3 em 05/11/2026. O piloto passa a consultar e gravar a agenda pelo servidor, seguindo as regras já validadas na demo.

- Agendar aulas pontuais ou semanais, com término opcional.
- Adicionar e retirar bloqueios pontuais ou semanais.
- Remarcar uma ocorrência ou alterar o restante da série, preservando identidades e aulas iniciadas.
- Conferir conflitos no PostgreSQL dentro da mesma transação da gravação e reaproveitar a grade e os formulários do produto no piloto.

## Capabilities

### New Capabilities

- `connected-teacher-schedule`: agenda persistida com comandos autorizados e proteção contra conflitos concorrentes.

## Impact

Migração aditiva local, API ASP.NET Core, aba Agenda no piloto e testes com PostgreSQL real. Registros, preparação e progresso conectados pertencem ao 3C4. O portal conectado permanece no 3D e a infraestrutura hospedada permanece no 3E.
