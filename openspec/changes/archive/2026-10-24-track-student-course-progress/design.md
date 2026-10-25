# Design

## Context

O 1C já tem acervo, cópia histórica do utilizado, homework e plano por ocorrência. Falta sequência e situação pedagógica do aluno. A aula da agenda e a aula do material têm durações independentes.

## Goals / Non-Goals

**Goals:** retomar e avançar pelo lançamento; preservar histórico e compatibilidade; não deixar edições antigas retrocederem o estado atual.

**Non-Goals:** portal, backend, novas dependências, hierarquia adicional de livros/módulos, avanço automático de nível ou conclusão inferida de registros antigos.

## Decisions

- Acrescentar número opcional ao material, único por nível. Sem número é complementar. Ordem crescente aceita lacunas; próximo é o seguinte disponível, sem exigir cadastro de números inexistentes.
- Formato v4 aceita migração v1/v2/v3 em memória. Materiais antigos continuam sem número; nenhum lançamento antigo recebe conclusão automática. Demo nova traz sequência fictícia A1.
- Guardar resultado pedagógico no registro: situação e referência da continuidade, distinta da cópia do material utilizado. A referência guarda título/nível/número para preservar a leitura histórica.
- Progresso é consulta dos resultados com presença, por aluno/nível e data/hora do encontro, não um ponteiro atualizado por ordem de salvamento. Consultar uma ocorrência usa apenas encontros anteriores. Isso evita regressão ao editar o passado e não reage a alterações de timestamp por correção de homework.
- Em andamento guarda referência ao mesmo material; concluída guarda o próximo disponível ou fim. Material avulso e falta não geram resultado de progresso. Trocar explicitamente o material permite selecionar o ponto real do aluno.
- O lançamento novo prioriza o progresso do aluno sobre o plano opcional. Sem sequência disponível, mantém o comportamento de sugerir o planejamento. Edição conserva seleção/cópia/resultado existentes até intervenção explícita.
- No fim, manter nível atual e informar ausência de próxima aula. Se novos conteúdos forem acrescentados depois, pode sugerir o seguinte na ordem atual. Referência que deixou de pertencer à sequência exige seleção explícita, sem sugerir conteúdo de outro nível.
- Material planejado e assuntos adicionais continuam disponíveis como preparação e texto trabalhado. Não exigir terminar o conteúdo em um encontro.

## Risks / Trade-offs

- Editar registro antigo pode retroceder aluno → ordenar pelo encontro, testar criação fora de ordem e edição de antigos.
- Renumerar acervo pode reescrever história → cópias/referências no registro; consulta atual só usa material ainda pertencente ao nível.
- Conclusão marcada antes de falha ao salvar pode avançar indevidamente → operação pura e persistência única já existente, com teste de falha e recarga.
- Complementares confundidos com sequência → numeração opcional e indicação explícita no formulário.
