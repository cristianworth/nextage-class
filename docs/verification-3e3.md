# 3E3 — Preparação de hospedagem e evidências parciais

Em 09/11/2026, Cristian escolheu preparar o Render Free localmente. A [comparação](hosting-options-3e.md) registra condições, riscos e sinais para reavaliar. O E3 continua em andamento; não houve publicação ou alteração hospedada.

## Preparação

- A API serve arquivos estáticos quando existem e devolve a página inicial para navegação da interface; `/api` desconhecida e métodos diferentes de GET/HEAD não viram a página inicial. Os endpoints protegidos mantêm autorização.
- `Dockerfile` reúne interface em modo piloto e API em um serviço; recebe URL e chave **publicável** do Supabase durante a compilação. A verificação Vite rejeita chave não publicável. `.dockerignore` exclui dados locais e ambientes privados do contexto.
- A porta de execução usa `PORT`, ou 8080 por padrão. Segredos, conexão do banco e parâmetros de Auth da API são variáveis externas de execução; nunca colocá-los em argumentos de compilação ou Git. O navegador recebe apenas a URL e a chave publicável e elas são públicas por definição.
- A execução e o processo de migração são separados. Antes de qualquer migração hospedada, conferir projeto e versão, fazer backup adequado e obter autorização específica; a inicialização normal não aplica migrações automaticamente.

## Verificado

- Compilação Release da API e build do piloto com configuração fictícia.
- API publicada em diretório isolado servindo o build: `/` e rota de interface retornaram HTML 200; `/api/session` sem credenciais retornou 401 e `/api/unknown` retornou 404. Navegador Edge abriu e recarregou a tela de acesso servida pela API.
- 48 testes HTTP da API com PostgreSQL isolado, 130 testes da interface e 22 percursos simulados no Edge passaram. OpenSpec validado em modo estrito.
- A primeira tentativa dos percursos de navegador não iniciou porque o Chromium do Playwright não estava instalado; repetidos com Edge instalado, passaram. A compilação Debug inicial encontrou o executável da API local em uso; a Release isolada passou.

## Limites e roteiro antes da liberação

Docker não estava disponível no ambiente; a imagem, seus argumentos, porta e contexto ainda precisam de build e execução reais com configurações fictícias. Os testes locais não verificam acesso entre Render e Supabase, TLS, limites, suspensão e retomada, entrega de e-mail, configurações de Auth nem armazenamento/recuperação hospedados. Não se deve declarar implantação pronta.

Antes de criar ou publicar qualquer serviço, obter autorização específica e verificar plano, região, limites e eventual cobrança; manter teste e uso real separados. Antes de dados reais, combinar backup protegido, retenção e recuperação; confirmar que é restaurável em destino isolado; comparar migrações e conferir autorização antes de aplicá-las. Verificar logs sem segredos, saúde `/api/health/live` e prontidão `/api/health/ready`, acesso, HTTPS, recarga e 404, e registrar versão anterior para recuo. O envio real e B4 exigem suas próprias autorizações e evidências. Uma reversão de código não desfaz automaticamente alterações no banco; planejar recuperação separadamente.
