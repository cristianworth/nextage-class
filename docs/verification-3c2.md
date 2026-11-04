# 3C2 — Acervo conectado

## Pedido e base

Em 04/11/2026, Cristian aprovou o cadastro 3C1, pediu máscara de telefone com DDD e autorizou avançar ao acervo. Commits e push foram liberados quando necessários. Base desta entrega: master em 0f4e8ca, após o ajuste de DDD. A demo continua referência executável; seus dados não são importados no piloto.

## Entrega

- Migração aditiva 003_teacher_catalog.sql: sequências em app.books, materiais em app.materials e primary_book_id opcional no aluno. RLS habilitado, sem privilégios públicos; nenhuma migração antiga foi reescrita.
- GET /api/catalog retorna sequências/materiais em snapshot de leitura coerente; GET /api/books fornece opções sem carregar textos. POST/PUT /api/books e /api/materials validam e persistem as edições. Todas essas rotas exigem teacher ativo, incluindo as leituras administrativas.
- Sequências têm título e níveis A1–C2 sem repetição. Unidade exige sequência e número 1–9999; herda os níveis atuais dela. Apoio tem níveis próprios e nenhum número. Índice único no banco impede números repetidos na mesma sequência, inclusive sob concorrência.
- Criação e atualização vêm do banco, preservando ID e data de criação. Edição permite converter unidade/apoio sem recriar identidade. Texto é apresentado literalmente, sem interpretar HTML.
- Cadastro e sequência principal são salvos na mesma transação. Campo omitido preserva o vínculo; null remove explicitamente. Nova seleção exige compatibilidade; promoção de nível preserva a sequência já vinculada e indica incompatibilidade. Acesso, identidade e convites continuam preservados.
- O piloto oferece navegação Alunos/Acervo, reutilizando MaterialsPage, BookForm, MaterialForm e MaterialDetails. Formulários aguardam a resposta, impedem duplo envio/fechamento durante gravação e preservam os campos em erro. A importação de exemplos continua exclusiva da demo.

## Evidências novas

- **31 testes HTTP aprovados** com PostgreSQL nextage_class_tests. Sete novos cenários cobrem criação/edição, texto literal, níveis herdados, validações sem gravação, 404, concorrência de unidade, conversão unidade/apoio, vínculo omitido/removido/incompatível, 401/403, RLS e ausência de grants públicos. Os 24 anteriores continuam aprovados.
- **Dois cenários integrados aprovados**, Edge em computador 1440 × 1000 e celular 390 × 844: interface → proxy Vite → Kestrel real → PostgreSQL. Criam sequências, unidades 2/10 e apoio; corrigem número duplicado sem perder conteúdo; editam e recarregam; conferem busca/filtro, herança de níveis, texto literal, seleção/remoção/troca do principal e indicação de incompatibilidade. A negativa de acesso do aluno ao acervo também foi conferida.
- **14 cenários de navegador com serviços simulados aprovados**. O novo cenário mantém sequência/material em erro, aguarda resposta e bloqueia envios repetidos; os anteriores de sessão e convites continuam aprovados.
- **125 testes de domínio**, **49 cenários da demo local** e **oito cenários da demo pública construída** aprovados. Builds do piloto e público, formatação e os 21 itens OpenSpec estritos aprovados. Esses resultados são desta entrega, não apenas referências históricas.
- Capturas do acervo, leitura e vínculo principal revisadas nos dois tamanhos, sem ultrapassagem horizontal. Artefatos locais em work/verification-3c2/connected; relatórios C# em work/test-results e navegador em work/playwright-pilot e work/playwright-public.
- Migração 003 aplicada e repetida no banco local de desenvolvimento. Comparação antes/depois confirmou cadastros, perfis e convites preservados; acervo terminou vazio, sem importação de exemplos. Cópia privada anterior à migração em work/verification-3c2/before-migration.dump. Os testes terminaram sem seus registros nas cinco tabelas de aplicação.

Os testes integrados simulam somente o provedor de identidade com JWTs efêmeros assinados; não simulam /api. Nenhuma conta Supabase ou convite real foi criado. Ativação/entrada/saída da professora foram validadas por Cristian anteriormente; recuperação e aluno real continuam no B4. A cópia local pré-migração não substitui a restauração operacional ainda prevista no 3E.

## Repetir a conferência técnica

Com dependências npm da raiz/web, SDK e PostgreSQL preparados:

```powershell
./scripts/start-local-database.ps1
./scripts/test-api.ps1
$env:PLAYWRIGHT_CHANNEL = 'msedge'
./scripts/test-api.ps1 -Browser
npm run test:e2e:pilot
npm test
npm run test:e2e
npm run build:public
npm run test:e2e:public
npm run format:check
npm run spec -- validate --all --strict
```

As execuções C# usam o mesmo banco de testes e devem ser sequenciais. A suíte integrada usa porta 4179 e API em porta dinâmica; não usa a sessão nem o banco da professora. Os testes removem somente seus próprios registros. A conta de desenvolvimento permanece separada.

## Revisão de uso sugerida

O objetivo de Cristian é avaliar organização e clareza, sem repetir toda a bateria técnica. Pode revisar as capturas ou usar o piloto em http://127.0.0.1:5174 com sua conta de professora:

1. Abra Acervo → Nova sequência e informe um título fictício e nível A1.
2. Em Novo material, escolha Unidade de sequência, selecione essa sequência e informe número/título/texto. Confira também a alternativa Material de apoio.
3. Em Alunos → Editar cadastro, confira se selecionar a Sequência principal está claro.

Resultado esperado: sequência/unidades/apoios organizados como na demo e seleção do principal integrada ao cadastro. O acervo do piloto pode estar vazio inicialmente; os exemplos automatizados são removidos do banco de testes. Não precisa criar conta de aluno ou enviar convite. Retorno sugerido: “O acervo atende; pode seguir para a agenda” ou “No passo ___, preciso que ___”.

## Reavaliação e limites

3C1 aceito e ajuste de DDD entregue. 3C2 implementado e conferido tecnicamente, com revisão de uso do acervo pendente. Próximo resultado do roadmap: agenda no servidor 3C3; depois registros/preparação/progresso/homework 3C4. O vínculo principal já está persistido, mas a retomada de progresso pelo servidor depende dos registros do 3C4. Não há progresso fictício criado para declarar esse fluxo pronto.

A migração 003 foi aplicada somente ao banco local; conexão hospedada e operação permanecem no 3E. O push atualiza código e pode acionar o workflow existente da demo pública; não publica a API ou o piloto. B4 permanece aberto e continua necessário antes do portal conectado 3D e do uso real.
