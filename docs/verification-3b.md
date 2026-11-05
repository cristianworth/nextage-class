# Verificação parcial do 3B — contas e convites

Validação humana em 29/10/2026: Cristian confirmou definição da senha, acesso à área de alunos/cadastro, saída e nova entrada com a conta da professora. O cadastro vazio é compatível com a separação entre demo e piloto. Recuperação real e acesso do aluno permanecem pendentes; B4 não foi marcado como concluído. A próxima implementação autorizada é o cadastro conectado 3C1, conforme reavaliação do roadmap.

Registro histórico de 29/10/2026, anterior à confirmação acima: Cristian informou retorno otp_expired ao abrir o convite. Um reenvio explicitamente autorizado foi aceito pelo provedor, preservando a identidade existente; piloto/API locais estavam prontos no momento do envio. Naquele momento, recebimento, ativação, login e recuperação ainda não estavam confirmados. A [demo pública](public-demo.md) foi priorizada e entregue separadamente; não encerra B4.

Estado consolidado em 26/10/2026: B1–B3 implementados e verificados localmente. B4 permanece aberto até o fluxo autorizado no provedor real. A demo e o piloto usam entradas separadas. As evidências abaixo são das execuções anteriores; preparar o handoff não equivale a repetir os testes nem verificar uma nova ativação de conta.

A continuação foi solicitada a partir do 3B. O sucessor deve confirmar com Cristian o resultado do convite/login e apresentar o menor recorte pendente antes de implementar. Criar dois alunos fictícios com credenciais de teste e conectar a API ao banco hospedado foram sugestões discutidas, ainda não executadas nem transformadas automaticamente em requisitos novos do B4. Ver [handoff de continuação](handoffs/2026-10-26-resume-3b.md).

## Comportamento entregue

- API valida JWT e vínculo ativo; papel e aluno não vêm de metadados editáveis.
- Somente a professora cadastra alunos e inicia convites. Falha não vira confirmação de sucesso; tentativas incertas ficam para revisão, sem reenvio automático.
- Entrada, ativação, recuperação e saída usam os SDKs oficiais, sem senhas próprias no C#.
- Interface descarta o contexto ao trocar de conta, ignora respostas atrasadas e preserva formulários em erro de gravação/renovação.
- Conta de aluno entra em uma confirmação de acesso. Consulta completa pelo servidor será entregue no 3D.

## Evidências

Os dezenove testes HTTP usam PostgreSQL real, tokens assinados e um provedor de convite simulado. Ver [contrato e limites](account-access.md). Os testes de navegador do piloto interceptam Auth e API com dados fictícios; não comprovam entrega de e-mail nem executam login real no Supabase. Conferem erro amigável, recuperação sem enumeração, papéis, acesso sem vínculo, cadastro assíncrono, convites, links inválidos/válidos, troca de conta, respostas atrasadas, renovação e saída em erro, computador e celular.

Resultado local: **19 testes HTTP**, **11 cenários de navegador do piloto**, **49 cenários de regressão da demo** e **109 testes de domínio/persistência** aprovados. Builds da demo e do piloto, formatação e validação OpenSpec aprovados. Capturas de computador/celular revisadas; nenhuma ultrapassagem horizontal nos cenários conferidos. Esses resultados técnicos não substituem o teste real de conta/e-mail nem o aceite de uso.

Na configuração real do projeto separado, foi confirmado: cadastro público desativado, acesso por e-mail habilitado e confirmação de e-mail mantida. As migrações estão aplicadas localmente e no Supabase. O schema app é privado e as tabelas têm RLS; não existe política pública de leitura. A ausência dessas políticas é intencional, pois as operações passam pela API.

Após Cristian configurar a chave administrativa no arquivo privado, ela foi aceita pelo provedor. A identidade do endereço de teste autorizado foi verificada pelo contrato administrativo e vinculada explicitamente ao perfil teacher no banco local e no projeto separado. Nenhum papel foi concedido pelo primeiro login ou por metadados do navegador. O link gerado retornou à porta 5174, em /auth/activate. O provedor confirmou a aceitação do envio do primeiro convite em 25/10/2026; isso não comprova chegada à caixa de entrada. Naquele registro, ativação, senha, login e recuperação ainda aguardavam conferência; a confirmação humana posterior da professora está no início deste documento. Destinatário e recibo de provisionamento ficam somente no ambiente privado, fora do repositório público.

A criação da conta exigiu separar os bancos locais de aplicação e testes. O script de preparação agora mantém ambos sem reset; a suíte foi executada no nextage_class_tests e os dezenove testes passaram. A conexão resultante e a preservação do vínculo teacher no desenvolvimento foram conferidas.

## Executar a conferência local

```powershell
./scripts/start-local-database.ps1
./scripts/run-api.ps1
```

Em outro terminal, após copiar web/.env.example para web/.env.pilot.local e configurar somente URL e chave publicável:

```powershell
npm run dev:pilot
```

Abrir http://127.0.0.1:5174. A conta inicial de professora já foi ativada por Cristian; entrar com a senha definida por ele, sem repetir o convite. Configurações privadas ficam em work/supabase/server-secrets.json, fora do Git; usar o modelo config/supabase-server.example.json. Nunca colocar a chave administrativa em VITE_ ou na conversa.

Após configurar o ambiente real: entrar com a conta autorizada da professora, cadastrar um aluno fictício, enviar um convite ao destinatário autorizado, abrir o link e criar a senha, sair/entrar, solicitar recuperação e conferir que a conta de aluno não tem ações administrativas. Usar apenas endereços de teste previamente autorizados.

Testes isolados, sem e-mails reais:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e:pilot
npm run test:e2e
npm test
./scripts/test-api.ps1
npm run build
npm run format:check
npm run spec -- validate --all --strict
```

Os testes do piloto usam a porta 4178 e guardam capturas em work/playwright-pilot. A demo usa 4177; os testes não alteram o armazenamento da prévia manual.

## Incidente de disponibilidade — 04/11/2026

Cristian relatou falha no login e na solicitação de recuperação. Consulta administrativa ao projeto Nextage Class confirmou INACTIVE; sondagem pública do Auth falhou na conexão. Os serviços locais 5174/5080 estavam ativos. Isso comprova indisponibilidade externa, sem comprovar senha incorreta. A consulta de logs não retornou registros nesse estado; não atribuir o incidente a SMTP, limite de envios ou destinatário sem evidência.

Reativação do mesmo projeto solicitada e aceita, com transição para COMING_UP/RESTORING. Não foram recriados usuário/projeto, alterados senha, plano ou vínculo, nem enviados e-mails pela assistência. A interface passa a diferenciar falha de conexão/serviço do Auth e HTTP 429 de credenciais recusadas; detalhes internos continuam ocultos e recuperação bem-sucedida mantém resposta condicional. Referências: [pausa/retomada de projeto](https://supabase.com/docs/guides/platform/free-project-pausing) e [erros do Auth](https://supabase.com/docs/guides/auth/debugging/error-codes).

Dezessete cenários de navegador do piloto aprovados, incluindo três novos para falha de rede, serviço HTTP 503 e limite HTTP 429 tanto no login quanto na recuperação. Credenciais inválidas mantêm a orientação própria e detalhes do provedor não aparecem na interface. Build do piloto, formatação e 21 itens OpenSpec estritos aprovados. Não houve alteração nas regras ou dados do servidor/demo.

Após a retomada, /auth/v1/health respondeu 200 com a chave publicável do piloto. Consulta administrativa da identidade inicial retornou 200, mesmo ID e e-mail confirmado. Evidência sem segredos em work/supabase/auth-readiness-20261104.json. Isso comprova disponibilidade e preservação da identidade, sem testar ou alterar a senha do titular.

Reativar serviço não conclui o teste humano de recuperação. Cristian deve recarregar o piloto e tentar entrar; se as credenciais forem recusadas com serviço disponível, solicitar recuperação uma vez pela própria tela e conferir o e-mail. B4 permanece aberto até essa evidência humana e a conferência real do aluno.

## Pendências externas atuais do B4

1. Conferir recuperação de senha e políticas reais do Auth. Chave administrativa, retorno, ativação e entrada/saída da professora já foram conferidos; não pedir repetição por leitura de evidência antiga.
2. Alinhar identidade/destinatário de teste de aluno e conferir convite, ativação, entrada e acessos negados no provedor real. Não criar contas ou enviar novos convites por inferência.

Os testes assinados e a integração navegador/API/PostgreSQL do [3C1](verification-3c1.md) verificam a implementação, mas não encerram esses dois pontos externos. O banco de desenvolvimento continua local. Conexão hospedada, envio operacional de e-mail, implantação, backup/restauração e revisão antes de dados reais seguem no 3E, conforme roadmap.
