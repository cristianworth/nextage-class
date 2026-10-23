# Executar e verificar localmente

Requer Node.js 24 ou superior. As dependências e a ferramenta OpenSpec são locais e fixadas nos lockfiles.

Na raiz do repositório:

```powershell
npm ci
npm --prefix web ci
npm --prefix web run dev
```

Abrir `http://127.0.0.1:5173`. A demo usa dados fictícios no navegador, sem backend ou sincronização entre dispositivos.

```powershell
npm --prefix web run build
npm --prefix web test
npm --prefix web run test:e2e
npm run spec -- validate deliver-teacher-demo-1a --strict
npm run spec -- validate deliver-weekly-agenda-1b --strict
```

Os testes de navegador exigem Chromium do Playwright (na pasta `web/`, executar `npx playwright install chromium`). Como alternativa, no Windows com Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

A variável vale somente para a sessão atual. Os testes sobem um servidor próprio na porta 4177 e usam dados/relógio isolados. O navegador de uso manual continua na porta 5173. Não há publicação ou serviço externo de aplicação nesta etapa; as fontes são servidas localmente.

O formato local atual é v2, mas a chave continua `nextage-class:workspace:v1` para preservar as demos existentes. Dados válidos do 1A são migrados em memória; a próxima alteração salva o formato novo sem exigir reinício. Dados inválidos são preservados e apresentam a recuperação já existente. Não edite o armazenamento para atualizar a aplicação.
