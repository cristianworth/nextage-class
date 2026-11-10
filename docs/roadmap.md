# Roadmap atual — Nextage Class

Atualizado em 10/11/2026. Este é o quadro para acompanhar o trabalho atual e o próximo passo. O conteúdo anterior foi preservado integralmente no [histórico do roadmap](roadmap-history.md), onde datas e prioridades refletem seus momentos. As regras aprovadas estão em [decisões](decisions.md); evidências não equivalem a aceite de uso.

## Objetivo da primeira versão

Uma professora de idiomas organiza alunos, agenda e acompanhamento pedagógico; cada aluno adulto consulta suas aulas, histórico compartilhado e acervo, e solicita horários sujeitos à aprovação. O piloto deve ser acessível com contas individuais, preservar dados e ser recuperável. A [demo pública fictícia](public-demo.md) continua independente e serve ao portfólio. A [visão do produto](product-vision.md) explica problema e público.

**Onde estamos:** funcionalidades da professora (3C) e do portal (3D) foram verificadas tecnicamente com ambiente local e identidades fictícias. O acesso real da professora foi confirmado; recuperação real e acesso real do aluno continuam abertos no **B4**. Estamos no **3E: preparar a operação do piloto**. Ainda não existe evidência de que a operação hospedada esteja pronta para alunos e dados reais.

## Próximos passos, em ordem

| Ordem | Trabalho | Resultado para avançar | Estado / dependência |
| --- | --- | --- | --- |
| **Concluído tecnicamente** | **E3.2 — Preparar a implantação** | Imagem executada com dados fictícios e roteiro de configuração, ambientes, observabilidade, migrações e recuo preparado. | Teste em runner temporário passou; operação no Render continua sem verificação e publicação exige autorização. [Evidências](verification-3e3.md) · [Roteiro](pilot-deployment-runbook.md). |
| **Agora** | **E3.3 — Planejar recuperação** | Definir destino protegido e testar viabilidade das metas combinadas; demonstrar recuperação apropriada em destino isolado, incluindo limites de Auth/configuração. | Ponto de partida: cópia diária, sete dias de retenção, responsabilidade de Cristian, perda desejada de um dia e recuperação desejada em um dia útil; ainda não são garantias. E1 não comprova recuperação hospedada. [Inventário](pilot-recovery-inventory.md) · [E1](verification-3e1.md). |
| **Em paralelo quando necessário** | **E-mail e acesso real — E4 / B4** | Escolher envio viável; conferir projeto e configurações; verificar recebimento, ativação, entrada/saída, recuperação e isolamento dos acessos reais pertinentes. | Cristian não tem domínio. O SMTP padrão tem restrições; identidade, destinatário e cada ação externa exigem autorização específica. [Acesso](account-access.md) · [Opções](hosting-options-3e.md). |
| **Depois** | **E5 — Integração e decisão de liberação** | Em ambiente autorizado, verificar frontend → API → banco/Auth, HTTPS, permissões, falhas e recuperação; reunir evidências e riscos antes de decidir uso real. | Depende de E3 e E4/B4. Conferir situação das migrações no projeto correto antes de qualquer alteração; preservar a demo. |
| **Após uso real, se aprovado** | **Acompanhamento do piloto** | Observar a rotina com Nara e alunos, registrar dificuldades e corrigir primeiro o que impedir uso ou causar perda de dados. | Sugestão de acompanhamento proporcional, sem prometer novos recursos ou transformar feedback em aceite automático. |

E1 (recuperação local) e E2 (acabamento de histórico e menu) passaram tecnicamente; detalhes e demais entregas estão no [histórico](roadmap-history.md). As tarefas e contratos do 3E permanecem no [plano detalhado](../openspec/changes/prepare-pilot-operation-3e/tasks.md).

## Decisões e limites para o piloto

- **Hospedagem:** Cristian escolheu começar gratuitamente e preparar Render Free para avaliação, aceitando espera. O próprio provedor não recomenda o plano Free para produção; sua adequação para uso real ainda precisa ser avaliada. Não há domínio próprio. Limitações e sinais de reavaliação ficam em [opções de hospedagem](hosting-options-3e.md).
- **Banco e identidade:** usar o projeto Supabase separado do Nextage Class; API mantém regras e autorização. O banco de testes local é separado do de desenvolvimento. Não presumir que migrações locais posteriores já estejam no projeto hospedado.
- **Recuperação:** ensaio local não prova recuperação de identidades, configurações ou dados hospedados. Definir e testar a estratégia antes de usar dados reais; nunca restaurar sobre destino existente sem autorização específica.
- **E-mail:** ainda não há solução aprovada para convites e recuperação de alunos arbitrários. Investigar opções sem domínio e eventuais custos antes de propor contratação.
- **Autorizações:** escolha de preparação e commit/push não autorizam criar conta, publicar piloto, contratar, configurar provedor, aplicar migração hospedada, usar dados reais, criar identidades ou enviar mensagens. Alinhar cada ação externa necessária.
- **Aceite:** assistência executa verificações técnicas e continua quando o comportamento definido passa; a [revisão pessoal opcional](pending-human-testing.md) não bloqueia uma etapa. Validações reais do B4 e da operação são necessárias e não são substituídas por testes simulados.

## Critério de chegada ao piloto utilizável

A primeira versão estará pronta para decisão de uso quando houver evidência do fluxo da professora e do aluno no ambiente autorizado; acesso e permissões reais verificados; envio e recuperação de conta operacionais; migrações conferidas e aplicadas somente com autorização; cópia e restauração adequadas demonstradas; e responsáveis, limites, riscos e resposta a falhas conhecidos. A decisão final de colocar dados reais no piloto tem seu próprio marco. Esses critérios não exigem integrações ou funcionalidades das etapas futuras.

## Ideias para depois — não comprometidas

As etapas a seguir são **possibilidades condicionais**, priorizadas por necessidade observada e nova decisão, não parte obrigatória da primeira versão:

| Possibilidade | Exemplos já mapeados | Quando reconsiderar |
| --- | --- | --- |
| **4 — Integrações** | Calendário, reuniões e lembretes; o link manual atende no início. | Quando o uso demonstrar valor; definir contas, permissões e falhas antes de integrar. [Questões](deferred-questions.md). |
| **5 — Evolução pedagógica** | Áudio, arquivos, apresentações, dispensa/adiamento de unidades e vários apoios no encontro; streak depende de regra própria. | Quando uma necessidade concreta for validada; especificar cada recorte antes de construir. |
| **6 — Expansão** | Mais professores e administração. | Somente com demanda e modelo de separação de dados definido. |

**Sugestões adicionais para avaliar após o início do piloto:** um registro leve de dúvidas e incidentes; revisão periódica de uso, custo e limites dos serviços; e uma revisão dos fluxos que mais gerarem dificuldade em computador ou celular. Escolher melhorias a partir de exemplos reais, sem transformar estas sugestões em escopo aprovado.

## Limites de escopo e manutenção do plano

Público inicial: uma professora, alunos adultos, aulas individuais e um fuso. Sem IA no produto, cobrança, saldo/reposição, importação automática do sistema atual, turmas ou múltiplos professores nesta versão. Homework permanece simples; leitura do acervo não altera progresso. Mudanças de escopo dependem de decisão explícita.

Ao concluir uma etapa, a cada três recortes ou diante de uma restrição relevante, revisar esta ordem e atualizar primeiro os documentos afetados. A execução contínua cobre decisões rotineiras; questões de produto e ações externas seguem seus marcos próprios. Quando algo for concluído, manter este quadro curto e acrescentar contexto ao histórico ou às evidências vinculadas, sem substituir decisões canônicas.
