# Primeira entrega funcional: fluxo do professor

Status: proposta de incremento 1A do roadmap. Não é uma especificação final nem autorização para iniciar código nesta entrega documental.

## Resultado esperado

Demonstrar um ciclo completo com um aluno fictício: cadastrar, agendar uma aula pontual, registrar o que aconteceu e reencontrar o histórico depois de recarregar o navegador.

## Casca da aplicação a criar na implementação

- Aplicação React + TypeScript + Vite em `web/`.
- Estrutura visual simples e navegação entre agenda, alunos e histórico do aluno.
- Estados iniciais e dados fictícios para experimentar o fluxo.
- Acesso ao armazenamento local separado dos componentes conforme a necessidade concreta.
- Interface em português e um caminho utilizável no celular.

Sem tela de login fictícia que sugira segurança real; identificar a demo como fictícia/local.

## Fluxo demonstrável

1. Abrir a demo e cadastrar um aluno com os dados mínimos definidos na especificação.
2. Agendar uma aula para esse aluno dentro da grade validada.
3. Conferir que um conflito simples não é salvo.
4. Abrir a aula e lançar presença/falta e conteúdo trabalhado, respeitando os campos definidos para esse recorte.
5. Consultar o registro no histórico do aluno.
6. Recarregar o navegador e reencontrar aluno, aula e registro.
7. Reiniciar os exemplos da demo mediante uma ação explícita.

## Não entra neste incremento

Recorrência, bloqueios e remarcação ficam no incremento 1B. Homework, material planejado e acervo completo em texto entram no 1C. Portal do aluno, servidor, autenticação, integração Google e apresentações pertencem a fases posteriores.

O recorte inicial não deve impedir essas evoluções: a aula pontual já precisa ter uma data, um aluno e identidade própria, sem se confundir com uma regra semanal.

## Antes de implementar

- Abrir uma mudança OpenSpec com escopo, cenários e tarefas pequenas.
- Resolver LATER-01 a LATER-04 na medida necessária ao recorte; não inventar permissões do portal.
- Esboçar o caminho entre cadastro, agenda e histórico.
- Escolher mecanismo de persistência, validação e verificações apropriadas.
- Combinar qual parte Cristian quer implementar e qual faremos juntos.

## Como validar a entrega

A professora percorre uma situação fictícia e aponta diferenças relevantes da rotina. Cristian explica o fluxo de dados e executa os passos acima. Verificações automatizadas devem proteger regras relevantes, principalmente conflitos e preservação de registros; não substituem essa conferência prática.
