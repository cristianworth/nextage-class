# Design

## Context

Demo React/TypeScript com operações puras, validação Zod, persistência local v2 e identidade estável de ocorrências semanais. Registros materializam ocorrências; remarcação em lote substitui exceções futuras. Ver proposta e decisões para o escopo.

## Goals / Non-Goals

**Goals:** preparação utilizável, histórico estável e migração sem reset; interface proporcional ao recorte, sem dependências novas.

**Non-Goals:** portal do aluno, hierarquia de livros/módulos, editor rico, uploads, submissão/correção parcial, autenticação, backend e integrações.

## Decisions

- Formato local v3 acrescenta `materials` e `plans`; registros ganham cópia do material e homework opcionais, alunos ganham link opcional. Validar v1/v2 antes da conversão, conservando a mesma chave. Migração não injeta conteúdo no acervo existente.
- Acervo em texto simples com título, nível e conteúdo. Criar/editar/consultar, sem exclusão neste incremento. Conteúdo renderizado como texto, sem HTML/Markdown executável. Demo nova traz exemplos próprios; não acessar acervos privados.
- Planejamento guarda material e anotação por ID da ocorrência. Materializar a ocorrência ao planejar, sem gerar registro de aula. Na remarcação em lote, recalcular materializados com plano usando a mesma identidade; recusar se o término eliminaria um deles.
- Contexto anterior ordenado por data/hora real da ocorrência e filtrado pelo aluno. Último conteúdo vem de presença anterior; homework pendente vem de registros anteriores, sem limite que esconda pendências.
- Homework pertence ao registro: descrição única e data de correção nula ou timestamp. Alterar a descrição reinicia a correção; editar outros campos a preserva. Limpar explicitamente remove o homework. Correção pode ser desfeita no histórico.
- Ao selecionar material utilizado, copiar ID, título, nível, texto e atualização para o registro. Edição comum preserva a cópia; a UI distingue manter a versão registrada, selecionar a atual ou usar texto livre. Material planejado não vira utilizado automaticamente sem salvar o lançamento.
- Link manual por aluno, com HTTP/HTTPS e sem credenciais. Abrir com `noopener noreferrer`; sem consultar provedores, gerar salas ou exigir link no cadastro.
- Reutilizar componentes existentes e separar novas operações de domínio. A professora continua no único perfil; acervo do aluno pertence à fase 2.

## Risks / Trade-offs

- Histórico pode acompanhar indevidamente o acervo → cópia no registro e teste de edição posterior.
- Planejamento pode ficar órfão ao mudar série → manter materializados por identidade e validar a proposta inteira antes de gravar.
- Tarefa pode aparecer corrigida após descrição alterada → mudança de texto deixa pendente e a UI explica esse efeito.
- Migração pode perder campos → schemas anteriores preservados, testes v1/v2 com histórico, séries e bloqueios e sem gravação durante leitura.
- Crescimento do texto no localStorage → limites por campo e tratamento já existente de cota; arquivos e acervos extensos ficam para servidor.

## Implementation assumptions

Confirmado: uma descrição por aula e correção inteira. Título/nível/conteúdo e planejamento por ocorrência são escolhas revisáveis adotadas enquanto as outras respostas não chegam. Não representam aceitação humana da demo.
