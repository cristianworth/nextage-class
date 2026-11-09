# Opções para a operação do piloto — 3E

Pesquisa em 09/11/2026, com documentação oficial vinculada abaixo. Limites e preços podem mudar; conferir antes de criar serviços. Cristian prefere começar gratuitamente, aceita a espera e escolheu preparar localmente o Render Free como primeira opção. Não tem domínio. Isso não autoriza criar contas, publicar, migrar o banco hospedado, configurar SMTP, enviar mensagens ou contratar serviços.

## Hospedagem

| Opção | Possibilidade e limites observados | Avaliação |
| --- | --- | --- |
| [Render Free](https://render.com/docs/free) | Serviço web gratuito, HTTPS e endereço próprio do Render; pausa após 15 minutos sem tráfego e pode demorar cerca de um minuto para acordar. São 750 horas mensais por workspace, compartilhadas; excedê-las suspende os serviços gratuitos. Transferência e builds têm cotas separadas e podem gerar cobrança ou bloqueio. Arquivos locais são efêmeros. O fornecedor diz para não usar Free em produção. | Escolhido para preparo local e avaliação prévia. Conferir limites, adequação e riscos antes de uso real; não prometer disponibilidade. |
| [Koyeb](https://www.koyeb.com/docs/faqs/pricing) | Uma instância gratuita limitada; documentação informa cartão, pré-autorização de US$ 29 e seleção inicial do plano Pro com cobrança proporcional, além de custos por excedentes. | Menos adequado à preferência de começar sem gasto; não cadastrar por inferência. |
| [Railway](https://docs.railway.com/pricing/plans) | Plano Free com crédito mensal limitado de US$ 1; Hobby custa US$ 5/mês e uso excedente pode custar mais. | Alternativa se o uso medido couber ou um plano pago for aprovado; não assumir custo zero contínuo. |

O Render fornece HTTPS e endereço `onrender.com`; domínio próprio não é obrigatório para abrir o site. Suas [regiões disponíveis](https://render.com/docs/regions) não incluem São Paulo: verificar latência e tratamento de dados entre regiões, pois o Supabase escolhido fica em São Paulo. A demo pública atual permanece independente.

### Limitações aceitas para investigação e quando reavaliar

| Limitação | Efeito prático | Sinal para reavaliar |
| --- | --- | --- |
| Serviço dorme após 15 minutos sem acessos | A primeira pessoa após a pausa pode esperar cerca de um minuto; requisições durante a retomada precisam de verificação real. | A espera atrapalhar as aulas, o acesso ou a experiência combinada com Nara/alunos. |
| Instância e cotas gratuitas limitadas | Pode haver suspensão, bloqueio de builds ou cobrança de excedentes conforme configuração da conta; não há garantia de operação contínua. | Consumo próximo das cotas, interrupções recorrentes, necessidade de disponibilidade maior ou condição de cobrança inaceitável. |
| Render recomenda não usar Free em produção | A adequação para um piloto com dados reais não está demonstrada e exige avaliação explícita. | Necessidade de confiabilidade, suporte ou compromissos de serviço maiores; resultado insatisfatório da revisão antes de dados reais. |
| Armazenamento local efêmero | Arquivos gravados no servidor se perdem em pausa, reinício ou atualização; banco e cópias precisam ficar fora dele. | Necessidade de armazenar anexos, relatórios ou arquivos enviados por pessoas. |
| API fora do Brasil; banco em São Paulo | Mais distância de rede pode afetar tempo de resposta e envolve avaliar circulação de dados entre regiões. | Lentidão medida, exigência de localização de dados ou mudança nas condições dos provedores. |
| Supabase Free pode pausar; sem backup automático contratado | Acesso pode parar e recuperação depende do procedimento externo, ainda não definido para ambiente real. | Atividade baixa causar pausas, recuperação manual não atender à perda/tempo aceitáveis ou volume de dados tornar cópias difíceis. |
| Sem domínio e sem SMTP operacional para alunos | Convites e recuperação reais ainda não atendem destinatários arbitrários; serviço gratuito de teste não resolve o fluxo completo. | Início de convites reais ou necessidade de recuperação por usuários; comparar domínio/remetente e serviço com condições atuais. |

Essas limitações são aceitas apenas para a investigação e o preparo local. A escolha de usar o serviço com alunos e dados reais, inclusive eventual mudança para plano pago, será reavaliada com evidências e autorização própria. Revisitar esta tabela antes da liberação E5 e sempre que surgir um dos sinais acima.

## Formato técnico a verificar

A interface do piloto usa caminhos relativos `/api`. A preparação local serve a interface compilada e a API no mesmo serviço ASP.NET Core, preservando mesma origem, autenticação e ausência de CORS adicional. O Render suporta [imagens Docker](https://render.com/docs/docker). A aplicação compilada foi conferida localmente com dados fictícios; Docker e operação no Render ainda não foram verificados. [Evidências e roteiro](verification-3e3.md). A publicação exige autorização separada.

O projeto Supabase existente continua como banco e Auth. A conexão precisa de TLS e segredos somente no servidor. Para IPv4, investigar pooler em modo sessão; a documentação distingue esse modo do modo transação, que não preserva bloqueios de sessão usados pelas migrações. Para migrações e backup, o Supabase recomenda conexão direta. Testar compatibilidade e acesso antes de depender deles; não aplicar migrações hospedadas sem autorização. [Conexões Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## E-mail e domínio

O [SMTP padrão do Supabase](https://supabase.com/docs/guides/auth/auth-smtp) só envia aos endereços autorizados da equipe do projeto e possui limite de duas mensagens por hora no momento da consulta. Assim, não serve para convidar alunos arbitrários. SMTP personalizado é uma opção, mas provedor, identidade do remetente, necessidade e eventual custo de domínio continuam em aberto. O endereço gratuito do site não concede domínio próprio para autenticar mensagens. Não foi comprovada uma solução gratuita sem domínio para envio a alunos; investigar antes de assumir compra ou entrega.

## Recuperação e uso real

O [Supabase pode pausar projetos Free com pouca atividade por sete dias](https://supabase.com/docs/guides/platform/free-project-pausing). A [orientação para o plano Free](https://supabase.com/docs/guides/platform/backups) recomenda exportações regulares e cópias externas; não tratar backup automático como disponível. O ensaio [E1](verification-3e1.md) usa somente dados locais fictícios e não demonstra restauração de Auth ou do ambiente hospedado. Definir responsável, destino protegido, frequência, retenção, perda e tempo aceitáveis; ensaiar restauração isolada antes de dados reais.

## Próximas verificações

1. Concluir a verificação da imagem Docker e da configuração da opção escolhida, sem publicar por inferência; registrar limites do que não puder ser testado.
2. Alinhar recuperação e investigar envio a alunos sem domínio, incluindo condições atuais e custos reais antes de propor contratação.
3. Antes de qualquer publicação ou uso real, alinhar ações externas, conferir o projeto correto, backup, migrações, observabilidade, B4 e rollback; testar HTTPS, autenticação e isolamento no ambiente autorizado.
