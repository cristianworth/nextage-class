# Verificação parcial do 3B — contas e convites

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

Após Cristian configurar a chave administrativa no arquivo privado, ela foi aceita pelo provedor. A identidade do endereço de teste autorizado foi verificada pelo contrato administrativo e vinculada explicitamente ao perfil teacher no banco local e no projeto separado. Nenhum papel foi concedido pelo primeiro login ou por metadados do navegador. O link gerado retornou à porta 5174, em /auth/activate. O provedor confirmou a aceitação do envio do primeiro convite em 25/10/2026; isso não comprova chegada à caixa de entrada. Ativação, senha, login e recuperação ainda aguardam a conferência real. Destinatário e recibo de provisionamento ficam somente no ambiente privado, fora do repositório público.

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

Abrir http://127.0.0.1:5174. A conta inicial de teste foi provisionada; o responsável deve aceitar o convite e definir sua própria senha. Sem ativação, ainda não há senha para entrar. Configurações privadas ficam em work/supabase/server-secrets.json, fora do Git; usar o modelo config/supabase-server.example.json. Nunca colocar a chave administrativa em VITE_ ou na conversa.

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

## Pendências externas do B4

1. Chave administrativa configurada e aceita; retorno de ativação conferido. Ainda verificar a recuperação e as políticas de senha reais do Auth.
2. Conta inicial de teste e vínculo teacher provisionados explicitamente. Aguardar aceitação do convite e conferência de login pelo responsável, sem compartilhar senha ou link de ativação na conversa.
3. Primeiro convite aceito pelo provedor para o destinatário autorizado. Verificar recebimento; o SMTP padrão é limitado e alunos reais exigem SMTP próprio antes do uso, conforme documentação do provedor.
4. Conferir ativação, login, recuperação e acessos negados contra o projeto real. A conexão de desenvolvimento da API ainda usa PostgreSQL local; a conexão privada ao banco hospedado precisa de configuração explícita para o piloto.

Essas pendências não serão consideradas resolvidas por testes simulados. Hospedagem, recuperação e dados reais seguem condicionados ao 3E.
