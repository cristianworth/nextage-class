# 3C1 — Cadastro conectado

## Pedido e base

Em 29/10/2026, Cristian confirmou ativação, definição da senha e entrada/saída da professora. Solicitou replanejar o roadmap, usar a demo no desenvolvimento e começar a próxima implementação. Base: master em 4e6d13e, árvore inicialmente limpa.

A demo é a referência executável de UX/regras e fonte de cenários fictícios para os testes. Seus dados não são importados para o piloto. O cadastro vazio observado por Cristian é esperado.

## Entrega

- GET/POST existentes foram preservados; PUT /api/students/{id} permite corrigir os mesmos campos de cadastro, somente com perfil Teacher ativo.
- StudentInput mantém validação de nome, nível, data e campos complementares. ID desconhecido retorna 404 e valores inválidos não alteram o banco.
- A transação preserva ID, criação, convites, vínculo e papel. O nome exibido de um perfil student vinculado acompanha a edição.
- A criação do perfil após um convite relê o nome com lock na mesma transação. Uma edição durante o envio não deixa o nome antigo na conta.
- O piloto reutiliza StudentForm da demo, com edição pelo cartão do aluno. Lista muda após confirmação da API; falha mantém o texto e permite nova tentativa. A renovação de sessão preserva o método PUT e o aluno escolhido.
- Acervo e sequência principal continuam no próximo recorte 3C2. Nenhuma senha, conta ou convite real foi criado nesta implementação.

## Verificações novas

- 23 testes HTTP aprovados com PostgreSQL real no banco nextage_class_tests, separado do desenvolvimento. Incluem edição de aluno convidado, identidade/convite preservados, perfil coerente, validação sem gravação, 404, 401/403 e edição durante entrega simulada.
- 13 cenários de navegador do piloto aprovados em Edge, com Auth/API simulados. Dois cenários novos verificam erro, nova tentativa, recarga e renovação de token durante PUT; os cenários anteriores de convite/troca de conta permanecem aprovados.
- Build do piloto aprovado em work/verification-3c1/pilot-build. Build público e seus oito cenários também passaram, sem publicação nova. O artefato da demo permaneceu com os mesmos hashes de JS/CSS.
- Formatação, validação estrita OpenSpec e whitespace conferidos. Testes HTTP não enviam e-mails reais; a validação humana do acesso da professora é uma evidência separada fornecida por Cristian.

## Revisão prática

1. Abra o piloto local em http://127.0.0.1:5174 e entre como professora.
2. Cadastre um aluno fictício, sem enviar convite. Recarregue: o cadastro deve permanecer.
3. Use Editar cadastro, altere nome/nível ou dados complementares e salve.
4. Recarregue e abra a edição novamente: os valores confirmados devem permanecer. Não é necessário criar outra conta de e-mail para essa conferência.

## Próximo recorte e limites

Após revisar este cadastro, avançar para acervo e vínculo pedagógico 3C2. B4 continua aberto para recuperação real e acesso/permissões do aluno. Antes do portal conectado 3D, concluir essas evidências. Publicação da demo não hospeda o piloto e não autoriza uso com dados reais.
