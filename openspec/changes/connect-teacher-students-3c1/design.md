# Design

## Context

POST/GET /api/students e formulário compartilhado já existem. O cadastro é restrito a Teacher; vínculo e papel ficam em app.access_profiles. A demo e o piloto continuam separados.

## Decisions

- Acrescentar PUT /api/students/{id} com StudentInput existente. Validar antes de gravar, usar SQL parametrizado e retornar 404 para ID inexistente.
- Atualizar cadastro e nome do perfil student vinculado na mesma transação. Papel, identidade, estado ativo, convite e created_at não mudam.
- Ao finalizar um convite, reler o nome atual com lock da linha do aluno. Isso serializa a criação do perfil com uma edição ocorrida durante o envio e evita inserir um nome antigo.
- Reusar StudentForm em modo de edição no piloto, sem sequência principal até o acervo conectado 3C2. A resposta confirmada pela API atualiza a lista; falha preserva formulário e dados anteriores.
- A demo fornece UX e cenários de teste, sem importação automática ou concessão de contas fictícias. A operação mantém a semântica simples de substituição dos campos editáveis; controle de edição concorrente de cadastro fica para um recorte justificado pelo uso.

## Risks / Trade-offs

Cadastro sem acervo ainda não permite vincular sequência principal; isso é explícito no 3C2. Testes de navegador simulam Auth/API; testes HTTP usam PostgreSQL real em banco separado. Não tratá-los como teste humano de recuperação/aluno.
