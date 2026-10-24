# Design

## Context

O 1C e seu refinamento de progresso usam formato local v4. O nível do registro já é distinto do cadastro, mas a UI permite alterar ambos os contextos; o seletor lista todos os níveis e duplica o campo livre.

## Goals / Non-Goals

**Goals:** lançamento simples, nível consistente, filtro e histórico preservado; planejamento atualizado para a etapa 1.

**Non-Goals:** novos recursos de homework, livros como entidades, múltiplos níveis por material, portal, backend ou formato v5.

## Decisions

- Derivar o nível no domínio do aluno para novos lançamentos e do registro anterior para edição. O campo de entrada legado continua aceito por compatibilidade, mas não determina o nível salvo. A UI mostra texto/badge, sem controle editável.
- Filtrar o único seletor pelo nível. Permitir manter cópia histórica ou texto livre antigo como opção especial, sem expor editor de novo texto livre. Opção sem material permite encontro de conversação e preserva o progresso.
- Domínio rejeita nova seleção incompatível, inclusive se o catálogo mudou depois da abertura do formulário. Manter a cópia histórica não depende do nível atual do item no acervo.
- Renomear exibição para Unidade e manter campo numérico/IDs atuais. Não renomear títulos nem reescrever histórico persistido. Nenhuma migração é necessária.
- Carregar exemplos por ação explícita no acervo, mesclando apenas ausentes; não usar reset para preencher demo migrada. Operação pura + gravação atômica existente; erros aparecem sem fechar a tela.
- Reorganizar o roadmap em 1D (agora), 1E (organização do acervo, níveis atendidos, uma sequência principal + apoios) e 1F (revisão real da demo). O 1E precisa resolver unidade de ordenação e troca do livro principal antes de implementação.

## Risks / Trade-offs

- Filtro esconder material histórico → opções de manter versão/texto original, testadas após troca de nível.
- Remover texto livre perder dados → somente novos lançamentos deixam de digitá-lo; históricos mantêm ou retiram explicitamente a referência.
- Acervo antigo vazio impedir demonstração → ação de acrescentar exemplos sem reset ou alteração de conteúdo existente.
- Níveis múltiplos exigirem trocar modelo novamente → manter isso explicitamente no 1E; não tratar filtro atual por nível único como solução final de livros.
