# 3C3 — Agenda conectada

Implementação concluída tecnicamente em 05/11/2026 a partir de `5b0474a`. Cristian autorizou avançar ao 3C3. A revisão de uso do acervo segue registrada separadamente.

O piloto oferece a aba Agenda com navegação por semana e consulta por dia no celular. A professora pode agendar aulas pontuais e séries semanais, criar e retirar bloqueios e remarcar uma aula ou o restante da série. O detalhe da aula abre o link manual do cadastro.

As rotas `/api/agenda` exigem o perfil ativo de professora. A migração 004 acrescenta séries, segmentos, ocorrências gravadas e bloqueios. O servidor valida conflitos dentro da transação de escrita, considerando as exceções e toda a duração das séries. Uma remarcação preserva a identidade da ocorrência e rejeita coordenadas desatualizadas. As aulas que já começaram conservam os horários anteriores.

## Evidências

- 37 testes da API com PostgreSQL. Os seis novos cenários incluem concorrência, conflito a 2.000 semanas de distância, término e limites de hora, remarcação desatualizada, alteração de série com preservação do passado e permissão por perfil.
- Dois percursos integrados em Edge, com API e PostgreSQL reais e emissão de identidade simulada. Cobrem criação de série, erro com formulário preservado, remarcação individual e em série, bloqueio semanal, recarga, retirada confirmada e negativa da agenda ao aluno. Capturas de desktop e celular em `work/verification-3c3/connected`.
- 125 testes de domínio, 49 cenários da demo local, 17 do piloto simulado e oito da demo pública aprovados. Builds do piloto e da demo aprovados.
- Migração 004 aplicada e repetida no PostgreSQL local. A comparação das cinco tabelas anteriores confirmou cadastros, perfis, convites, sequências e materiais preservados. A agenda de desenvolvimento começa vazia. A cópia anterior à migração está em `work/verification-3c3/before-migration.dump`.

## Revisão de uso

1. Entre no piloto em `http://127.0.0.1:5174/` e abra **Agenda**.
2. Use **Nova aula** para escolher um aluno cadastrado, um dia útil futuro e um horário. Marque **Repetir toda semana** para experimentar a série. O encontro deve aparecer na grade e persistir após recarregar e voltar à aba.
3. Abra a aula e confira a remarcação. Em **Bloquear horário**, use um período livre e confira a confirmação de remoção.

O 3C4 conecta preparação, registros, histórico e progresso. O B4 continua aberto para recuperação e acesso real do aluno. O banco hospedado e a operação do piloto seguem no 3E.
