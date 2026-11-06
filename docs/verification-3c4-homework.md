# 3C4 — Homework conectado

Cristian validou a preparação e autorizou seguir ao próximo recorte. O piloto permite registrar uma descrição de homework por aula, consultar no histórico, marcar e desfazer a correção e conferir pendências anteriores na preparação de outra ocorrência do mesmo aluno.

A API preserva a correção ao editar outros campos, torna a tarefa pendente se sua descrição mudar e remove a tarefa se o texto for limpo. Correções usam o mesmo lock das gravações da agenda; uma aba que tenta corrigir uma descrição alterada recebe conflito. O contexto anterior respeita aluno e data/hora efetiva.

## Verificações

- 41 testes HTTP com PostgreSQL isolado, incluindo cenário novo de criação, edição, correção, retorno a pendente, remoção e proteção contra descrição desatualizada.
- Dois percursos Edge integrados em computador e celular, com API e PostgreSQL reais e identidade simulada, passaram com gravação, recarga, edição e correção do homework na próxima aula.
- 128 testes de domínio passaram, incluindo o filtro de pendências anteriores por aluno e horário; build do piloto aprovado.
- Migração aditiva aplicada e repetida em teste e desenvolvimento local. Backup em `work/verification-3c4-homework/before.dump`; a comparação preservou o conteúdo anterior de onze tabelas. Banco hospedado não foi alterado.

A revisão de uso do homework continua pendente. O progresso por aluno e livro, o B4 e a operação hospedada mantêm seus recortes próprios. Os ajustes visuais do histórico e do menu continuam registrados no roadmap.
