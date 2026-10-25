# Primeira entrega funcional: fluxo do professor

Status: incremento 1A implementado e verificado tecnicamente em 23/10/2026, sob autorização de Cristian. Documento histórico do 1A. O aceite da etapa 1 foi informado por Cristian em 24/10/2026; estado atual em [README.md](README.md). Requisitos e tarefas estão na mudança OpenSpec `deliver-teacher-demo-1a`; evidências em [verification-1a.md](verification-1a.md).

## Resultado esperado

Demonstrar um ciclo completo com um aluno fictício: cadastrar, agendar uma aula pontual, registrar o que aconteceu e reencontrar o histórico depois de recarregar o navegador.

## Estrutura entregue

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

## Decisões aplicadas no incremento

- Nome/nível obrigatórios; demais dados complementares opcionais.
- Aula pontual com identidade e data próprias; grade das 07h às 22h e fuso `America/Sao_Paulo`.
- Lançamento após o término; edição de um único registro por aula.
- localStorage versionado e validado; falhas não apagam silenciosamente o conteúdo existente.
- Material em texto livre até o acervo do 1C. Somente o perfil da professora está disponível.

## Como validar a entrega

A assistência de IA executa e registra as verificações técnicas. A professora pode percorrer uma situação fictícia e apontar diferenças relevantes da rotina; Cristian acompanha o resultado e valida a adequação ao pedido, sem precisar escrever código. Verificações automatizadas devem proteger regras relevantes, principalmente conflitos e preservação de registros; não substituem a conferência prática.
