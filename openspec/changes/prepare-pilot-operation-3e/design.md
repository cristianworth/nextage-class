# Design

## Context

Ver proposta e contratos. A API é ASP.NET Core, com health checks e conexão externa; a demo usa GitHub Pages, e o Vite encaminha `/api` somente no desenvolvimento. O PostgreSQL local possui migrações versionadas, e os backups pré-migração foram comparados, mas isso não comprova uma rotina de recuperação operacional. O banco hospedado contém somente as migrações anteriores autorizadas; não presumir que esteja alinhado ao local. A identidade real da professora foi conferida; recuperação e identidade de aluno permanecem no B4.

## Goals / Non-Goals

**Goals:** validar recuperação com dados fictícios sem tocar na origem; esclarecer dependências de implantação e demonstrar acabamento em telas reais. Permitir que decisões externas sejam tomadas com custo, limites e riscos verificáveis.

**Non-Goals:** publicar ou contratar nesta proposta, restaurar sobre dados existentes, migrar automaticamente a demo, criar usuários reais, enviar convites ou editar projeto hospedado sem autorização por ação. Não substituir Supabase Auth nem adicionar recursos pedagógicos.

## Decisions

1. **Isolamento primeiro.** A primeira entrega proposta produz cópia e restauração em banco local de teste claramente distinto, valida nomes/destinos e rejeita origem igual ao destino. Fazer cópia antes de qualquer mudança no banco de desenvolvimento; não apagar nem sobrescrever um destino já existente sem plano e autorização. Alternativa de testar restauração no banco de desenvolvimento descartada pelo risco de perder dados.
2. **Conferir recuperação, não apenas exportação.** Comparar registros representativos e relações de alunos, agenda, histórico, materiais, progresso e solicitações, incluindo cópias históricas. Documentar formato, versão, integridade e falhas. A cópia do schema `app` não prova recuperação de identidades Supabase Auth, configuração do projeto, segredos nem objetos externos: mapear cada componente e testar sua recuperação sem sobrescrever identidades reais.
3. **Hospedagem sem antecipar fornecedor.** Preparar comparação de opções atuais compatíveis com .NET, HTTPS, proxy `/api`, custo, pausas e segredos; escolher apenas após alinhamento. O caminho de implantação dependerá da opção escolhida. A demo GitHub Pages continua separada; não pressupor que o proxy de desenvolvimento exista no build estático.
4. **B4 e e-mail.** Conferir projeto correto, cadastro público, redirecionamentos, remetente e restrições do provedor. Escolher destinatário de teste, SMTP e autorização antes de criar identidade ou enviar mensagens. B4 exige chegada, ativação, entrada/saída, isolamento e recuperação reais, conforme aplicável; testes simulados são complemento.
5. **Acabamento localizado.** Reproduzir descrição longa no histórico e comparar menu do piloto com a demo em computador/celular. Corrigir transbordamento e organizar navegação sem modificar regras pedagógicas nem redesenho geral. Repetir testes de navegação, histórico e acessibilidade relevantes.
6. **Operação gradual.** Registrar o que é local, ensaiado e hospedado; definir responsável por cópias, frequência, retenção, perda aceitável, tempo de recuperação e resposta à indisponibilidade antes de dados reais. Testes de produção e alterações externas somente após autorização adequada. Não inferir que um commit publica o piloto.

## Risks / Trade-offs

- Cópia local íntegra não garante recuperação de Auth ou de um serviço hospedado → inventariar separadamente identidades, configuração e dados e documentar limites dos ensaios.
- Restauração em destino errado → identificação explícita, recusa do destino de origem e confirmação antes de qualquer operação que substitua dados.
- Plano gratuito e SMTP padrão sujeitos a limitações → verificar documentação e custos no momento da escolha; não prometer disponibilidade ou custo zero.
- Proxy de desenvolvimento ausente no ambiente hospedado → testar URLs, HTTPS, sessões e chamadas da API na arquitetura escolhida antes de liberar uso.
- Regressão visual ou de isolamento → validar computador/celular com dados fictícios, testes existentes e inspeção do conteúdo permitido.

## Migration Plan

Nenhuma migração hospedada é autorizada por este planejamento. Primeiro executar ensaio local isolado e documentar resultado; depois comparar provedores e preparar roteiro de configuração, backup anterior e recuo. Qualquer aplicação hospedada deve identificar projeto, banco, histórico de migrações, efeitos, backup verificado e plano de recuo antes de autorização específica. Na recuperação, não usar uma restauração destrutiva como recuo automático.

## Open Questions

- Qual orçamento, domínio e tolerância a pausas/indisponibilidade são aceitáveis para o piloto? Qual fornecedor de hospedagem e SMTP atende às condições atuais?
- Qual destino protegido, frequência, retenção, perda máxima de dados e prazo de recuperação são aceitáveis? Quem será responsável pela rotina?
- Qual identidade e destinatário serão autorizados para B4 e em qual ambiente será verificado o fluxo real?