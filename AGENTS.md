# Working on Nextage Class

## Collaboration

- Converse em português com Cristian. Use inglês natural para novos identificadores, nomes de arquivos, testes e comentários técnicos. A documentação de produto e os textos da interface começam em português.
- Preferência atual: Cristian guia o produto, acompanha decisões e valida entregas; a assistência de IA implementa e verifica. Não reservar tarefas para Cristian programar, a menos que ele peça. Explique escolhas relevantes para que ele consiga acompanhar o desenvolvimento.
- IA auxilia o desenvolvimento. Não adicione recursos de IA ao produto.
- Estado atual: Etapa 1 entregue; aceite do 1F por Nara informado por Cristian em 24/10/2026. Sequências didáticas incluem livros ou conteúdo autoral; apoios ficam separados e o percurso é flexível. Dados locais v6 e homework preservados. 2A/2B entregues tecnicamente: consulta própria com material/homework, sem observações livres, e acervo somente do nível atual com histórico preservado; leitura não conclui unidades. 2C entregue tecnicamente: pedidos avulsos e semanais independentes/combináveis, aprovação obrigatória e sem reserva enquanto pendentes; decisão revalida conflitos. Próximo recorte: 2D, revisão integrada de uso com Cristian/Nara; aceite humano pendente. Servidor permanece na etapa 3. Não confundir unidade do material com encontro da agenda.

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
- Mantenha nomes claros, responsabilidades coesas e regras fora dos componentes quando houver uma fronteira real. Use Clean Code de forma proporcional, sem camadas, interfaces ou padrões apenas por cerimônia. Trate erros e teste o comportamento relevante.
