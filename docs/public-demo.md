# Demonstração pública

Entrega autorizada e publicada em 29/10/2026: [experimentar a demo](https://cristianworth.github.io/nextage-class/). Publica somente a demo fictícia das etapas 1/2; piloto, autenticação e B4 continuam separados. Os oito cenários públicos passaram também no endereço HTTPS. Ver [evidências](verification-public-demo.md).

## Dados e restauração

O modo public-demo usa `nextage-class:public-demo:v1`, com envelope v1 contendo a data de criação e um workspace v6. A chave anterior `nextage-class:workspace:v1` permanece intacta; não há importação automática de dados de desenvolvimento.

A primeira visita salva exemplos relativos à semana atual e à seguinte. Há histórico, aula passada para registrar, sequência A2 de Lara, homework, preparação de aula futura e pedido pendente. Os textos são fictícios e próprios do projeto. Recarregar preserva as datas e edições; não desloca aulas, pedidos ou histórico silenciosamente. A data dos exemplos aparece no roteiro opcional. Reiniciar demo exige confirmação e recria exemplos relativos ao momento da restauração, descartando somente as alterações da demo pública após uma gravação bem-sucedida.

O armazenamento é do navegador. Não existe sincronização entre dispositivos, cadastro real ou autorização de contas na demonstração.

## Roteiro de revisão — até cinco minutos

1. **Professora:** consulte a agenda e o cadastro de Lara. Veja a sequência Inglês para viajar e a continuidade após a Unidade 1. Na semana seguinte, abra a aula de Lara de segunda às 09h e consulte sua preparação.
2. **Registro:** volte à semana anterior à inicial e abra a aula de Sofia de quarta às 10h que ainda não possui registro. Registre conteúdo e homework; consulte Histórico e recarregue para confirmar a persistência.
3. **Aluno:** use Ver como aluno e mantenha Lara. Confira próximas aulas, histórico/material usado, homework e Meu acervo A2. Observações da professora e planejamento não aparecem nessa consulta.
4. **Pedido e decisão:** em Solicitações, crie um pedido avulso em horário disponível. Volte à professora, abra Solicitações e aprove ou recuse. Confira a decisão no aluno; se aprovado, confira a aula na semana correspondente. O pedido de exemplo ainda pendente não reserva horário.
5. **Restauração:** altere algo, use Reiniciar demo, cancele e confira a preservação. Depois confirme a restauração e recarregue: os exemplos reaparecem, sem alterar o armazenamento da demo local anterior.

## Executar e verificar

```powershell
npm ci
npm --prefix web ci
npm run build:public
npm --prefix web run preview -- --mode public-demo --port 5180
```

Abrir `http://127.0.0.1:5180/nextage-class/`. O build força a entrada demonstrativa e usa `/nextage-class/` como base. Marca e favicon respeitam o mesmo subdiretório.

```powershell
npm test
npm run format:check
npm run spec -- validate --all --strict
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e:public
```

O teste público usa o artefato compilado e um preview isolado na porta 4189. `PUBLIC_DEMO_URL` permite conferir a URL publicada com os mesmos cenários, sem iniciar esse preview. Os testes alteram apenas os contextos de navegador de teste, com dados fictícios. Nenhum serviço operacional deve ser chamado.

## Publicação

O workflow `.github/workflows/pages.yml` instala dependências fixadas, executa verificações, compila o modo público e envia somente `web/dist` ao GitHub Pages. Alterações de código da interface e do workflow disparam publicação em master; documentação isolada não exige recompilar a demo. API, banco, `work/`, arquivos privados e modo piloto não entram no artefato.

Referências oficiais consultadas em 29/10/2026: [workflow personalizado do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) e [Vite no GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages).

## Resumo para o chat do site

Nextage Class organiza a agenda e o acompanhamento pedagógico de uma professora particular de idiomas. Demo: https://cristianworth.github.io/nextage-class/ . Código: https://github.com/cristianworth/nextage-class . Demonstra agenda, continuidade, preparação, registro e homework; o aluno simulado consulta aulas, histórico permitido e acervo, solicita horários e acompanha a decisão da professora. A demo React/TypeScript é estática, usa dados fictícios restauráveis e persistência local separada. Pedidos pendentes não reservam horário; aprovar verifica conflitos. A API C#/PostgreSQL e o Auth Supabase pertencem ao piloto, que continua em validação 3B e não foi publicado.

## Limites do piloto

A publicação não comprova autenticação, entrega de convite, recuperação de senha, isolamento seguro entre contas, backup ou operação com dados reais. O convite expirado da professora foi reenviado com autorização em 29/10 e aceito pelo provedor; o resultado humano continua pendente. Conferir [estado do 3B](verification-3b.md) e [roadmap](roadmap.md) antes de retomar 3C.
