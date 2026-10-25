# Verificação parcial do 3B — contas e convites

Estado em 25/10/2026: B1–B3 implementados e verificados localmente. B4 permanece aberto até o fluxo autorizado no provedor real. A demo e o piloto usam entradas separadas.

## Comportamento entregue

- API valida JWT e vínculo ativo; papel e aluno não vêm de metadados editáveis.
- Somente a professora cadastra alunos e inicia convites. Falha não vira confirmação de sucesso; tentativas incertas ficam para revisão, sem reenvio automático.
- Entrada, ativação, recuperação e saída usam os SDKs oficiais, sem senhas próprias no C#.
- Interface descarta o contexto ao trocar de conta, ignora respostas atrasadas e preserva formulários em erro de gravação/renovação.
- Conta de aluno entra em uma confirmação de acesso. Consulta completa pelo servidor será entregue no 3D.

## Evidências

Os dezenove testes HTTP usam PostgreSQL real, tokens assinados e um provedor de convite simulado. Ver [contrato e limites](account-access.md). Os testes de navegador do piloto interceptam Auth e API com dados fictícios; não comprovam entrega de e-mail nem executam login real no Supabase. Conferem erro amigável, recuperação sem enumeração, papéis, acesso sem vínculo, cadastro assíncrono, convites, links inválidos/válidos, troca de conta, respostas atrasadas, renovação e saída em erro, computador e celular.

Resultado local: **19 testes HTTP**, **11 cenários de navegador do piloto**, **49 cenários de regressão da demo** e **109 testes de domínio/persistência** aprovados. Builds da demo e do piloto, formatação e validação OpenSpec aprovados. Capturas de computador/celular revisadas; nenhuma ultrapassagem horizontal nos cenários conferidos. Esses resultados técnicos não substituem o teste real de conta/e-mail nem o aceite de uso.

Na configuração real do projeto separado, foi confirmado: cadastro público desativado, acesso por e-mail habilitado e confirmação de e-mail mantida. As migrações estão aplicadas localmente e no Supabase. Nenhum usuário Auth, perfil, aluno ou convite real foi criado até esta conferência. O schema app é privado e as tabelas têm RLS; não existe política pública de leitura. A ausência dessas políticas é intencional, pois as operações passam pela API.

## Executar a conferência local

```powershell
./scripts/start-local-database.ps1
./scripts/run-api.ps1
```

Em outro terminal, após copiar web/.env.example para web/.env.pilot.local e configurar somente URL e chave publicável:

```powershell
npm run dev:pilot
```

Abrir http://127.0.0.1:5174. Sem conta/vínculo provisionados, não será possível entrar no espaço da professora. Configurações privadas ficam em work/supabase/server-secrets.json, fora do Git; usar o modelo config/supabase-server.example.json. Nunca colocar a chave administrativa em VITE_ ou na conversa.

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

1. Configurar a chave administrativa somente no servidor, as URLs permitidas de ativação/recuperação e verificar as políticas de senha no Auth.
2. Provisionar e verificar a conta inicial da professora. O primeiro login não concede papel automaticamente. Vincular o ID Auth confirmado ao perfil autorizado no banco usado pela API.
3. Usar destinatário de teste autorizado. O SMTP padrão é limitado aos endereços da organização; alunos reais exigem SMTP próprio antes do uso, conforme documentação do provedor.
4. Conferir ativação, login, recuperação e acessos negados contra o projeto real. A conexão de desenvolvimento da API ainda usa PostgreSQL local; a conexão privada ao banco hospedado precisa de configuração explícita para o piloto.

Essas pendências não serão consideradas resolvidas por testes simulados. Hospedagem, recuperação e dados reais seguem condicionados ao 3E.
