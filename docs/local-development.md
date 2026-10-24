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
npm run spec -- validate deliver-lesson-preparation-1c --strict
npm run spec -- validate track-student-course-progress --strict
```

Os testes de navegador exigem Chromium do Playwright (na pasta `web/`, executar `npx playwright install chromium`). Como alternativa, no Windows com Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

A variável vale somente para a sessão atual. Os testes sobem um servidor próprio na porta 4177 e usam dados/relógio isolados. O navegador de uso manual continua na porta 5173. Não há publicação ou serviço externo de aplicação nesta etapa; as fontes são servidas localmente.

O formato local atual é v4, mantendo a chave `nextage-class:workspace:v1`. Dados válidos v1/v2/v3 migram em memória e só são gravados na próxima alteração válida, sem reset. A migração de v3 preserva acervo, planos e histórico sem presumir números ou conclusões; v1/v2 iniciam acervo/planos vazios. Demo nova ou reiniciada traz nove textos próprios, com sequência A1. Para um acervo existente, numerar as aulas pelo formulário do material. Dados inválidos são preservados. Não edite o armazenamento para atualizar a aplicação.
