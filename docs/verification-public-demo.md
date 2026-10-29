# Verificação da demonstração pública

## Base e escopo

Conferência iniciada em 29/10/2026 sobre master, base 97c6fd0, com árvore inicialmente limpa. A mudança publish-public-demo preserva a identidade visual e o piloto. GitHub Pages gratuito no repositório existente foi autorizado por Cristian, incluindo configuração, testes, commits e push.

## Evidências novas

- 125 testes de domínio/persistência aprovados: incluem seed público com contratos reais, datas variadas, conteúdo permitido ao aluno, continuidade, armazenamento separado, recarga e recusa de gravação.
- 49 cenários de navegador da demo anterior aprovados em Edge. Migrações e chave anterior continuam compatíveis.
- 8 cenários do build público aprovados em Edge, servido no subdiretório `/nextage-class/`: primeira visita em dias úteis e fim de semana, assets/fontes/favicon, teclado, registro/homework e recarga, consulta do aluno, aprovação/recusa/conflito, confirmação de restauração e falha de gravação.
- Capturas de computador/celular foram revisadas; não houve ultrapassagem horizontal nos cenários móveis conferidos.
- O cenário de rede não registrou chamadas operacionais externas nem `/api/`. Inspeção do JavaScript compilado confirmou chave pública de demonstração e ausência do endpoint `/auth/v1`, chave de sessão do piloto e chamadas de API.
- Formatação, whitespace e validação estrita dos 19 itens OpenSpec aprovados.

Os testes usam dados fictícios e contextos de navegador isolados. Os 11 cenários do piloto com Auth/API simulados também passaram após a separação de modos, sem envio de e-mails pelos testes.

## Publicação e conferência HTTPS

O [workflow 40929140959](https://github.com/cristianworth/nextage-class/actions/runs/40929140959), commit c4a002a57732b0fea518c65c3a6b25d302e42991, concluiu build e deploy com sucesso. A pipeline repetiu unitários, formatação, OpenSpec e os oito cenários públicos com Chromium em Linux antes de publicar somente web/dist.

A URL [https://cristianworth.github.io/nextage-class/](https://cristianworth.github.io/nextage-class/) foi conferida em 29/10/2026. Os mesmos oito cenários passaram em Edge contra o HTTPS, sem servidor local (12,6 s). Isso inclui execução de fluxos, assets/fontes/favicon, recarga, tráfego sem chamadas operacionais e ausência de erros de console. As capturas atuais de computador/celular usadas no README vieram dessa execução publicada.

Revisão independente de código não encontrou achados acionáveis. Essa revisão estática complementa as verificações executadas; não é certificação de segurança ou aceite de uso de Nara/Cristian.

## Fluxos conferidos

| Fluxo | Resultado |
| --- | --- |
| Continuidade de Lara | Sequência A2, Unidade 1 concluída e Unidade 2 sugerida |
| Preparação | Aula de segunda da semana seguinte com plano consultável |
| Registro | Aula passada de Sofia salva e encontrada após recarga |
| Aluno | Material/homework compartilhados; observações e plano da professora excluídos |
| Pedido | Pendente mantém agenda; dois alunos podem pedir o mesmo horário |
| Decisão | Primeira aprovação cria aula; segunda aprovação em conflito não altera estado; recusa preserva agenda |
| Restauração | Cancelar preserva edições; confirmar restaura exemplos; chave anterior permanece byte a byte |
| Falha de gravação | Mensagem útil e formulário/estado anterior preservados |

## Evidências históricas e limites

Os 19 testes HTTP do 3B e a aceitação anterior do convite não foram repetidos para declarar a demo pública pronta. A demo não usa a API ou o Supabase. Nesta sessão, o reenvio explicitamente autorizado da professora foi aceito pelo provedor e a identidade foi preservada; isso não confirma recebimento, ativação ou login humano.

B4 continua aberto. Operação do piloto, autenticação/autorização reais, restauração do banco e dados reais permanecem fora desta publicação. O roteiro de revisão de até cinco minutos e a política de datas estão em [public-demo.md](public-demo.md).
