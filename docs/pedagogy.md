# Dados pedagógicos do 1C

Implementado e verificado tecnicamente em 24/10/2026 na mudança `deliver-lesson-preparation-1c`. Não representa validação de uso da professora. Ver [verification-1c.md](verification-1c.md).

- Formato local atual v4; a chave continua `nextage-class:workspace:v1`. Leitura aceita v1/v2/v3 validados e não grava até uma alteração válida. Migração de v3 preserva todo o acervo/planejamento; v1/v2 iniciam esses recursos vazios. Demo nova inclui nove textos fictícios próprios, com quatro aulas numeradas de A1.
- Material: título, nível A1–C2, texto simples, criação e atualização. Limites: título de 150 caracteres e conteúdo de 20.000. Sem uploads, editor rico ou exclusão neste recorte.
- Material utilizado: o lançamento recebe cópia de ID, título, nível, conteúdo e atualização. Editar o acervo não muda o histórico. Manter versão registrada e selecionar versão atual são ações diferentes.
- Homework: uma descrição de até 2.000 caracteres por aula registrada, com correção inteira reversível. Alterar o texto deixa pendente; editar outros campos preserva a correção. Limpar explicitamente retira a tarefa.
- Planejamento: material e anotação de até 5.000 caracteres por ocorrência, sem criar um registro de aula. A identidade acompanha remarcações; o domínio rejeita alterações que eliminariam uma ocorrência planejada pelo término da série.
- Preparação: último conteúdo com presença anterior à aula consultada e homework pendente anterior do mesmo aluno. A ordenação usa data/hora efetiva, inclusive remarcações.
- Link manual: campo livre opcional por aluno, validado como HTTP/HTTPS sem credenciais. Nenhuma integração externa é consultada.

Confirmado por Cristian: descrição única de homework e correção inteira. A definição posterior de sequência/progresso complementa o planejamento opcional por encontro: o conteúdo atual vem do lançamento do aluno, conforme [course-progress.md](course-progress.md).
