# 3C4 — Primeiro recorte: lançamento e histórico

Em 05/11/2026, Cristian aprovou o plano do primeiro recorte e pediu revisão antes da ampliação. A base é `master` em `63ea890`. O recorte conecta o lançamento de aulas encerradas e a edição do mesmo registro no histórico; preparação, correção de homework e progresso seguem pendentes.

## Implementação

- A API exige professora ativa, resolve a ocorrência no servidor e valida seu término no horário de Brasília. Uma semanal calculada é materializada junto ao registro sob o mesmo lock transacional da agenda. A chave única por ocorrência impede duplicação.
- A primeira gravação copia nome e nível do aluno e, quando selecionado, o material e o título da sequência. Editar sem trocar material mantém a cópia; remover ou trocar exige indicação explícita. A troca valida o nível original do registro.
- O piloto permite lançar pela agenda e consultar, filtrar, buscar e editar no histórico. Os indicadores de registro aparecem na agenda. Os controles de preparação, homework e progresso ainda não foram conectados neste recorte.

## Verificações novas

- 39 testes HTTP passaram no PostgreSQL `nextage_class_tests`, incluindo dois testes novos: limite de término, falta, conteúdo obrigatório, gravações concorrentes, edição e unicidade, semanal remarcada, mudança posterior da série, preservação histórica e troca de material pelo nível do registro.
- Dois percursos Edge com identidade simulada, API e PostgreSQL reais passaram em computador e celular. Incluem salvar, recarregar e editar o mesmo registro. As tentativas anteriores identificaram ajustes necessários no próprio roteiro: escolha de horário disponível, filtro pelo aluno de teste e espera da confirmação antes da recarga.
- 125 testes de domínio e 17 cenários do piloto com serviços simulados passaram. Builds web e piloto e validação estrutural estrita de 22 itens OpenSpec passaram.
- A migração foi aplicada e repetida no banco de testes e no PostgreSQL local de desenvolvimento. Cópias antes e depois, em `work/verification-3c4`, preservaram o conteúdo das nove tabelas anteriores. O projeto hospedado não foi alterado.

## Preparação para revisão de uso

Antes de entregar um roteiro prático, a assistência deve preparar e conferir a API, o piloto e os serviços locais necessários. Cristian autorizou reiniciar a API do projeto para isso e autorizou commits e push quando necessários, após as verificações pertinentes. A revisão humana do primeiro recorte continua pendente antes de ampliar o 3C4.

Em 05/11/2026, a API anterior foi reiniciada com o código atual e o piloto foi iniciado. A API respondeu `ready`, o piloto retornou HTTP 200 e a rota de registros respondeu HTTP 401 sem autenticação. Essas verificações de disponibilidade não substituem a revisão de uso.

Essas evidências não validam B4, a operação hospedada ou os demais recortes do 3C4. Os resultados do 3C3 registrados em `verification-3c3.md` são históricos, não novas execuções desta entrega.
