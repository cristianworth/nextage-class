# OpenSpec no Nextage Class

Estado: OpenSpec 1.14.3 instalado localmente e integração de desenvolvimento inicializada em `.agents/skills/`.

- `config.yaml`: contexto resumido e regras dos documentos futuros.
- `specs/`: reservado ao comportamento consolidado no encerramento das mudanças. Ainda vazio enquanto o 1A aguarda revisão de entrega.
- `changes/`: contém `deliver-teacher-demo-1a`, implementado e verificado tecnicamente, aguardando revisão.

Visão e roadmap ficam em `../docs/`; não devem ser copiados como se fossem comportamento pronto em `specs/`. Requisitos aprovados para implementação entram primeiro em uma mudança. Ao entregar e validar, consolidar as especificações e arquivar a mudança.

Consultar [o workflow do projeto](../docs/development-workflow.md). Na raiz, `npm run spec -- list` lista as mudanças; `npm run spec -- validate deliver-teacher-demo-1a --strict` valida os artefatos. Não gerar planos detalhados para todas as fases antecipadamente.
