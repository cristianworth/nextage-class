# Roteiro de implantação do piloto — preparação

Este roteiro prepara a operação; não autoriza criar serviço, publicar, alterar o Supabase, aplicar migrações ou enviar mensagens. O Render Free é a primeira opção para avaliação, não uma garantia de adequação ao uso real. Os [limites e sinais de reavaliação](hosting-options-3e.md), as [evidências](verification-3e3.md) e o [roadmap](roadmap.md) complementam este roteiro.

## Separar ambientes e configuração

1. Preservar a demo pública e seus dados fictícios. Identificar explicitamente ambiente de desenvolvimento, ambiente de teste com dados fictícios e projeto hospedado Nextage Class; não usar o projeto GachaManagement. Não reutilizar banco de desenvolvimento para testes que alteram dados.
2. Compilar a imagem a partir do `Dockerfile`. `VITE_APP_MODE=pilot`, URL do projeto Supabase e chave **publicável** são incorporadas ao frontend; elas não são segredos. Fornecer `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` na compilação, confirmando o projeto escolhido. O build rejeita chave fora do formato publicável esperado. Nunca incluir chave administrativa, senha ou connection string em argumentos de build, código, arquivos públicos ou Git.
3. No ambiente autorizado, fornecer externamente à API `ConnectionStrings__NextageClass`, `Supabase__Url` e, quando o envio tiver sido escolhido e autorizado, `Supabase__SecretKey` e `Supabase__InvitationRedirectUrl`. A chave administrativa existe apenas no servidor. Conferir quais URLs de ativação e recuperação são permitidas antes de qualquer fluxo real, sem registrar tokens ou senhas. A aplicação escuta `PORT` e não salva dados no sistema de arquivos efêmero.
4. Para rede do banco, verificar TLS, conexão e compatibilidade com os locks de sessão das migrações. A recomendação de conexão direta para migrações e a alternativa do pooler em modo sessão estão descritas na [análise](hosting-options-3e.md); não presumir conectividade ou aplicar migrações ao configurar a aplicação.

## Verificação antes de usar dados reais

1. Comparar o histórico de migrações do projeto correto com as migrações versionadas locais; identificar alterações, dependências e efeitos. Preparar cópia adequada e demonstrar recuperação isolada antes de solicitar a autorização específica para aplicar alterações hospedadas. Migração é separada da inicialização normal; uma reversão de código não reverte o banco.
2. Definir quem cuida das cópias, destino protegido, frequência, retenção, perda e prazo aceitáveis. A restauração local fictícia do E1 não comprova recuperação de Auth, configurações ou dados hospedados. Não restaurar sobre banco existente sem autorização específica.
3. No serviço autorizado, conferir HTTPS, abertura e recarga da interface, `/api/health/live`, `/api/health/ready`, 404 de API inexistente e 401 de sessão sem credenciais. Prontidão requer banco acessível e não deve expor detalhes da conexão. Conferir o fluxo autenticado e o isolamento professora/aluno com identidades autorizadas; mocks não concluem B4.
4. Verificar logs e alertas disponíveis sem incluir dados privados, tokens ou conteúdo pedagógico; combinar quem verifica falhas e como o serviço será retomado. Observar pausa, tempo de resposta, cotas, latência e eventual cobrança conforme o plano efetivamente escolhido.
5. Anotar versão anterior, configurações necessárias e responsável pela decisão de recuo. Se a versão nova falhar, interromper sua liberação e avaliar retorno à versão anterior compatível com o banco. Se houver mudança de dados ou esquema, usar o plano de recuperação aprovado e verificado: rollback de código sozinho não desfaz migrações.

## Teste repetível da imagem

O workflow [Verify pilot image](../.github/workflows/pilot-image.yml) executa [verify-pilot-image.sh](../scripts/verify-pilot-image.sh) em máquina temporária, usando somente valores fictícios. Ele constrói e executa a imagem sem publicá-la, verifica a exclusão de arquivo de ambiente fictício, escuta em porta definida, identidade não root, interface, saúde, 401, 404 e falha por configuração ausente. A execução não conecta ao Supabase real; não demonstra envio de e-mail, recuperação hospedada, TLS público ou B4. Resultados ficam vinculados em [evidências](verification-3e3.md).
