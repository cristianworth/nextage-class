# Design

## Context

O App atual compõe a área da professora e entrega Workspace às telas de edição. Agenda pública do domínio já resolve próximas ocorrências semanais e remarcadas. O formato v5 preserva material utilizado e homework por registro.

## Goals / Non-Goals

**Goals:** consulta própria, interface de leitura, modelo de dados explícito e demo honesta sobre simulação.

**Non-Goals:** login/autorização reais, escrita por aluno, acervo completo, solicitações, campos novos no lançamento ou formato v6.

## Decisions

- Criar função de consulta por aluno com campos permitidos explícitos. Reutilizar upcomingLessons/findLesson, sem reimplementar recorrência. Histórico ordenado por encontro efetivo; pendências derivadas desse histórico.
- Não copiar objetos de aluno, registro ou Workspace para o contrato da tela. Excluir conteúdo/observações, motivo de falta, planos, telefone, ocupação e interesses. Material em texto legado e cópia utilizada são compartilhados, como confirmado.
- Controlador da prévia conhece Workspace e oferece seleção de nomes fictícios nas ferramentas da demo. A tela de aluno recebe só o contrato reduzido e não recebe callbacks de gravação. Trocar o aluno remonta sua navegação/consulta para evitar estado visual residual.
- Abrir a prévia por Ver como aluno. Retornar mantém a área da professora; recarregar começa na professora. Modo e perfil da prévia ficam apenas em memória, sem gravar no documento local.
- Mostrar próximas seis aulas e link manual próprio; histórico com datas, situação, nível registrado, material e homework. Homework pendente/corrigido é apenas informativo. Sem edição ou marcação pelo aluno.
- Sem aluno cadastrado, seleção inválida ou lista vazia: mensagem clara, sem cair nos dados de outra pessoa. Não acrescentar exemplos automaticamente à base existente.

## Risks / Trade-offs

- Filtrar a tela não constitui autorização real: a demo usa todo o documento no navegador, e a seleção de perfil é uma ferramenta de simulação. O servidor deverá impor identidade/autorização no piloto.
- Histórico sem resumo livre é menos descritivo: decisão explícita de Cristian. Separar resumo público de anotação privada só se necessário em recorte posterior.
- Acervo após mudança de nível e solicitações dependem de respostas futuras no 2B/2C; não antecipá-las neste contrato.
