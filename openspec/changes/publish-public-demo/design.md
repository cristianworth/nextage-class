# Design

## Context

Ver proposal.md. A demo v6 e o piloto têm entradas distintas. O storage anterior migra versões em memória e usa uma chave fixa; não será modificado para importar exemplos públicos. GitHub Pages foi autorizado no repositório público existente, na branch master.

## Goals / Non-Goals

Exercitar os fluxos já aprovados com exemplos coerentes, sem ampliar o produto ou redesenhar telas. Nenhuma alteração de autenticação, autorização, schema ou hospedagem do piloto faz parte desta mudança.

## Decisions

- Criar seed público separado e reutilizar comandos de domínio para histórico, planejamento e solicitações. Preservar createDemo e a compatibilidade anterior.
- Criar envelope público versionado com workspace v6 e data de criação. Persistir na primeira visita, sob chave distinta. Alternativa descartada: substituir ou migrar automaticamente dados locais existentes.
- Gerar datas relativas ao momento de criação/restauração, incluindo a semana seguinte. Mostrar a data dos exemplos; não deslocar silenciosamente registros e pedidos já editados quando o calendário avançar.
- Usar modo de build public-demo, forçando a entrada da demo e base /nextage-class/. Publicar somente web/dist por workflow GitHub Actions. Corrigir assets em runtime para respeitar BASE_URL.
- Manter roteiro opcional em details, sem modal de onboarding. Manter confirmação explícita para restauração, inclusive diante de dados ilegíveis.

## Risks / Trade-offs

- Dados editados ficam antigos após semanas sem uso: oferecer restauração explícita com datas atuais, preservando as alterações até a confirmação.
- Persistência depende do navegador: testar recusa de gravação e não anunciar backup ou sincronização entre dispositivos.
- Simulação não prova autorização: manter o B4 e o piloto fora da publicação.

## Migration Plan

Sem migração destrutiva. A demo anterior conserva sua chave. Workflow publica um artefato estático versionado; rollback usa um commit anterior e nova execução de publicação. Publicação será verificada por navegador, além do resultado do workflow.
