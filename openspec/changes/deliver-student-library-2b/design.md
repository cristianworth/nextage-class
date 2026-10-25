# Design

## Context

O 2A entrega um contrato reduzido de consulta. O catálogo v5 já tem níveis por sequência/apoio, ordenação numérica e progresso derivado dos lançamentos. Nenhuma nova informação precisa ser persistida para o 2B.

## Goals / Non-Goals

**Goals:** acervo compatível completo, leitura simples e continuidade coerente com a professora.

**Non-Goals:** marcar lido/concluído, editar conteúdo, expandir homework, vários materiais por registro, solicitações ou autorização real.

## Decisions

- Criar consulta studentLibrary por aluno, retornando somente títulos, texto, níveis, identificação pública da sequência, número e atualização do material. Reutilizar materialsForLevel/materialLevels e courseSuggestion, sem duplicar suas regras.
- Filtrar exclusivamente pelo nível atual. Unidades herdam os níveis do livro/sequência; apoios usam seus próprios níveis. Retornar apenas sequências compatíveis. Cópias antigas continuam no histórico do 2A, sem liberar o catálogo inteiro de níveis anteriores.
- Principal sugere a unidade em andamento ou a próxima após conclusão. Sem principal, vazia, encerrada ou incompatível têm mensagens próprias; não presumir progresso para outro aluno nem expor título de sequência incompatível.
- Nova aba Meu acervo recebe contrato próprio, sem Workspace ou callbacks de gravação. Agrupar unidades por sequência e apoios separadamente, com busca e filtro por tipo. Painel de leitura na própria aba contém texto e ação de fechar; permite trocar o aluno pelas ferramentas da demo durante a leitura.
- Seleção de material fica em memória e é descartada quando muda o aluno. Não reutilizar o formulário/modal administrativo com um callback de edição inativo.
- Manter v5 e a simulação explícita. Leitura usa versão atual do acervo; histórico preserva a versão efetivamente utilizada.

## Risks / Trade-offs

- Alteração de nível pode retirar conteúdo da aba: regra escolhida por Cristian, preservando o histórico.
- Abertura de texto ser confundida com conclusão: não adicionar marcação ou atualizar progresso; mensagens e testes distinguem essas ações.
- A demo ainda tem todos os dados no navegador. Contrato reduzido protege a composição da interface, mas autorização real permanece responsabilidade do futuro servidor.
