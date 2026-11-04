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

## Verificações da implementação — 29/10/2026

- 23 testes HTTP aprovados com PostgreSQL real no banco nextage_class_tests, separado do desenvolvimento. Incluem edição de aluno convidado, identidade/convite preservados, perfil coerente, validação sem gravação, 404, 401/403 e edição durante entrega simulada.
- 13 cenários de navegador do piloto aprovados em Edge, com Auth/API simulados. Dois cenários novos verificam erro, nova tentativa, recarga e renovação de token durante PUT; os cenários anteriores de convite/troca de conta permanecem aprovados.
- Build do piloto aprovado em work/verification-3c1/pilot-build. Build público e seus oito cenários também passaram, sem publicação nova. O artefato da demo permaneceu com os mesmos hashes de JS/CSS.
- Formatação, validação estrita OpenSpec e whitespace conferidos. Testes HTTP não enviam e-mails reais; a validação humana do acesso da professora é uma evidência separada fornecida por Cristian.

## Complemento integrado — 04/11/2026

Base conferida: master em 0368431, árvore inicialmente limpa e um commit local à frente de origin/master. Cristian solicitou continuar e pedir validação com orientação concreta. A conferência técnica ficou com a assistência, sem usar senha pessoal nem solicitar cadastros manuais.

- Dois cenários integrados aprovados em Edge: computador 1440 × 1000 e celular 390 × 844. O navegador usa a interface do piloto e o proxy do Vite até a API real em Kestrel, ligada ao PostgreSQL nextage_class_tests. Nenhuma rota /api é simulada.
- Somente emissão de identidade e saída no provedor Auth são simuladas. JWTs efêmeros são realmente assinados; a API valida assinatura e consulta os perfis reais no banco de testes. Não foi criada conta no Supabase nem enviado e-mail. Isso não conclui B4.
- Fluxo conferido: criação com campos complementares, leitura após recarga, cancelamento sem gravar, validação real de link inválido sem perder o formulário, correção e edição, ID/data de criação preservados, nova recarga, saída, entrada como aluno, ausência de controles administrativos, PUT recusado com 403 e retorno à professora. Sem token, a API retorna 401. Nenhum convite criado, erro JavaScript ou chamada externa não prevista.
- Campos finais também comparados por leitura SQL independente. Capturas de lista/edição revisadas nos dois tamanhos, sem ultrapassagem horizontal; arquivos locais em work/verification-3c1/connected. O layout usado no teste é o existente, sem redesenho.
- O primeiro teste integrado revelou diferença de precisão no created_at: a criação retornava DateTime de memória, enquanto a recarga devolvia o valor armazenado pelo PostgreSQL. Corrigido com INSERT RETURNING created_at. A resposta inicial passa a representar exatamente o dado persistido, sem migração.
- A suíte HTTP passou de 23 para **24 testes aprovados**, incluindo igualdade completa entre resposta de criação e leitura posterior. A execução integrada tem **dois cenários aprovados**, separada da suíte HTTP. As contagens de 13 cenários simulados e oito públicos acima são históricas desta entrega e não foram repetidas neste complemento.
- Comparação local antes/depois confirmou alunos, perfis e convites do banco de desenvolvimento preservados. O banco de testes terminou sem registros nessas três tabelas. Formatação e os 20 itens OpenSpec estritos aprovados.

Execução repetível, após instalar as dependências da raiz/web e um navegador compatível:

```powershell
./scripts/start-local-database.ps1
$env:PLAYWRIGHT_CHANNEL = 'msedge'
./scripts/test-api.ps1 -Browser
./scripts/test-api.ps1
```

O comando com -Browser exige banco com sufixo _tests; usa porta isolada 4179 e uma porta dinâmica da API, sem substituir os processos 5174/5080. A fixture remove os registros criados, inclusive após falha de uma asserção. Relatórios em work/test-results/browser-api-tests.trx e api-tests.trx. Tokens efêmeros não são escritos nas capturas/relatórios.

## Revisão de uso por Cristian

Objetivo: avaliar se os campos e o caminho Novo aluno → Editar cadastro atendem à rotina da professora. A persistência e as permissões já foram conferidas pela assistência; não é necessário repetir a bateria técnica. Pode revisar as capturas locais do complemento ou usar o piloto abaixo. Não enviar convite para esta revisão.

1. Abra o piloto local em http://127.0.0.1:5174 e entre como professora.
2. Cadastre um aluno fictício, sem enviar convite. Recarregue: o cadastro deve permanecer.
3. Use Editar cadastro, altere nome/nível ou dados complementares e salve.
4. Recarregue e abra a edição novamente: os valores confirmados devem permanecer. Não é necessário criar outra conta de e-mail para essa conferência.

Retorno sugerido: “O cadastro atende; pode seguir para o acervo” ou “No passo ___, preciso que ___”. Cristian também pode dispensar explicitamente a revisão deste recorte. Login/ativação da professora já confirmados não precisam de nova validação.

## Próximo recorte e limites

Cristian aprovou o cadastro em 04/11/2026 e autorizou o acervo 3C2, solicitando apenas máscara de telefone com DDD. O formulário compartilhado passa a formatar números nacionais de dez/onze dígitos como (11) 3456-7890 e (11) 98765-4321. Valores incompletos, internacionais ou legados continuam editáveis sem truncamento nem inclusão de DDD inventado. A conferência integrada verifica celular na criação e telefone fixo na edição, com persistência.

B4 continua aberto para recuperação real e acesso/permissões do aluno. Antes do portal conectado 3D, concluir essas evidências. Publicação da demo não hospeda o piloto e não autoriza uso com dados reais.
