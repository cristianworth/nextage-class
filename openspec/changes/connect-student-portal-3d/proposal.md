# Proposal

## Why

A demo do aluno já foi aprovada como referência de comportamento, mas o piloto autenticado ainda oferece apenas uma confirmação de acesso. O 3D precisa conectar a experiência ao servidor sem expor dados reservados da professora ou de outros alunos.

## What Changes

- Acrescentar consultas próprias autenticadas de aulas, histórico compartilhado, homework e acervo compatível, derivadas do vínculo do perfil no servidor.
- Conectar a interface de aluno existente às consultas reduzidas, mantendo a demo e sua simulação independentes.
- Persistir pedidos avulsos e semanais, consultar disponibilidade sem detalhes privados e permitir decisão individual pela professora, com revalidação transacional.
- Verificar isolamento entre alunos, concorrência, recarga e regressões usando API/PostgreSQL reais de teste e identidade simulada.
- Preservar B4 real e operação hospedada do 3E como trabalhos separados, sem criar contas, enviar convites ou aplicar migrações hospedadas por inferência.

## Capabilities

### New Capabilities

Nenhuma; o 3D estende os comportamentos de aluno e solicitações já especificados.

### Modified Capabilities

- `student-overview`: consulta autenticada e reduzida das próprias aulas e histórico no piloto.
- `student-library`: acervo e continuidade autorizados no servidor para o nível atual.
- `scheduling-requests`: disponibilidade e pedidos persistidos com identidade autenticada e decisão transacional.

## Impact

API ASP.NET Core, autorização por perfil, PostgreSQL local, interface autenticada de aluno e área de decisão da professora. A demo existente continua independente. Acesso real do aluno e recuperação permanecem no B4; implantação, e-mail operacional, banco hospedado e backup/restauração no 3E.
