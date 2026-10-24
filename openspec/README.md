# OpenSpec no Nextage Class

Estado: OpenSpec 1.14.3 instalado localmente e integração de desenvolvimento inicializada em `.agents/skills/`.

- `config.yaml`: contexto resumido e regras dos documentos futuros.
- `specs/`: base implementada e verificada até o 1D, sincronizada para permitir que a mudança seguinte estenda requisitos existentes.
- `changes/`: as três entregas iniciais, `track-student-course-progress`, `simplify-lesson-entry-1d` e `organize-material-library-1e` estão implementadas e verificadas tecnicamente, aguardando revisão de uso. Deltas do 1E ainda aguardam consolidação. Ao arquivar as mudanças anteriores já sincronizadas, usar `--skip-specs` após conferir a base.

Visão e roadmap ficam em `../docs/`; não devem ser copiados como se fossem comportamento pronto em `specs/`. Requisitos aprovados para implementação entram primeiro em uma mudança. A sincronização da base técnica não declara aceitação da professora. Após revisão da entrega, consolidar deltas pendentes e arquivar as mudanças.

Consultar [o workflow do projeto](../docs/development-workflow.md). Na raiz, `npm run spec -- list` lista as mudanças; `npm run spec -- validate deliver-teacher-demo-1a --strict` valida os artefatos. Não gerar planos detalhados para todas as fases antecipadamente.
