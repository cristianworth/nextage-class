# Working on Nextage Class

## Collaboration

- Converse em português com Cristian. Use inglês natural para novos identificadores, nomes de arquivos, testes e comentários técnicos. A documentação de produto e os textos da interface começam em português.
- O modo padrão é pessoal/aprendizado: explique decisões novas com exemplos pequenos, combine recortes que Cristian queira implementar e revise seu trabalho. Tarefas repetitivas podem ser aceleradas por IA.
- IA auxilia o desenvolvimento. Não adicione recursos de IA ao produto.
- O escopo atual é documentação e planejamento. Não interprete documentos de funcionalidades futuras como autorização para implementá-las.

## Sources of truth

- Leia `README.md`, `docs/decisions.md` e `docs/roadmap.md` antes de propor trabalho.
- `docs/` contém visão, decisões, planejamento e perguntas; não afirma que funcionalidades existem.
- `openspec/specs/` fica reservado ao comportamento já entregue. `openspec/changes/` reúne propostas em andamento.
- Não promova proposta a requisito implementado antes da validação correspondente. Atualize a decisão canônica em vez de manter cópias divergentes.
- Diferencie decisões validadas, sugestões e questões abertas. Faça perguntas de arquitetura antes de depender da resposta; deixe detalhes de tela para a mudança correspondente.

## Development and version control

- Use OpenSpec de forma proporcional. Uma alteração pequena não exige uma proposta de produto inteira.
- Não crie branches adicionais sem pedido de Cristian. Não configure remoto, publique ou faça push sem a autorização correspondente.
- Antes de commit ou merge, procure changelog e regras de versionamento. Se existir changelog, avalie a versão e pergunte sobre sua atualização, salvo autorização já dada para a entrega.
- Preserve dados locais, credenciais, acervos privados, imagens de referência e arquivos temporários fora do histórico. A demo usa somente conteúdo fictício ou autorizado para publicação.
- Valide o comportamento relevante e efeitos plausíveis. Revisão por IA e validação estrutural de OpenSpec não substituem testes ou conferência prática.
- Não introduza frameworks, serviços ou abstrações extras sem uma necessidade demonstrada. A stack validada está em `docs/architecture.md`.
