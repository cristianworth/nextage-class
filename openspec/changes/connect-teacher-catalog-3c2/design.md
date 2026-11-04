# Design

## Context

Base master em 0f4e8ca; cadastro 3C1 aprovado por Cristian, com ajuste de máscara de DDD em entrega separada. PostgreSQL local e identidade Supabase continuam separados da demo. Publicação do piloto permanece no 3E; commits/push estão autorizados.

## Decisions

- Criar app.books e app.materials, com RLS e sem acesso público; acrescentar primary_book_id opcional ao aluno. Sem exclusão no escopo. FK preserva referências; índice único (book_id, lesson_number) impede unidades duplicadas mesmo sob concorrência.
- Sequências têm título e níveis A1–C2 não repetidos. Unidades herdam níveis da sequência na consulta, sem duplicar essa fonte no banco. Apoios guardam seus próprios níveis; unidade exige sequência/número e apoio não aceita número. Conteúdo é texto literal até 20.000 caracteres.
- GET /api/catalog retorna sequências e materiais em snapshot coerente; GET /api/books serve as opções de cadastro sem carregar textos. POST/PUT /api/books e /api/materials exigem Teacher ativo. Leituras também são restritas à professora; consulta do aluno pertence ao 3D.
- Salvar aluno e vínculo principal na mesma transação. Campo omitido na edição preserva vínculo; null remove explicitamente. Vínculo novo exige compatibilidade; manter o mesmo vínculo após troca de nível continua permitido e indicado. Locks no aluno e na sequência preservam a decisão durante a gravação.
- Reutilizar MaterialsPage, BookForm, MaterialForm e MaterialDetails. Formulários aguardam a API, preservam texto em erro e evitam envio/fechamento durante gravação. No piloto, não oferecer importação de exemplos. Navegação Alunos/Acervo descarta formulários ao sair da conta.
- Registros/progresso conectados ainda não existem. Não criar tabelas de histórico fictício: o 3C4 implementará snapshots e continuidade com os contratos já aprovados. Alterações do acervo não apagam identidades ou vínculos existentes.

## Verification

Testes HTTP com PostgreSQL separado: persistência, criação/atualização, níveis herdados, conversão unidade/apoio, números duplicados concorrentes, 400/404/401/403, vínculo preservado/limpo e migração repetível sem grants públicos. Navegador com API real em computador/celular: sequência, unidades 2/10, apoio literal, busca/filtro, erro corrigível, edição e vínculo após recarga. Identidade técnica simulada não encerra B4. Executar regressões dos formulários compartilhados e demo pública antes de push.
