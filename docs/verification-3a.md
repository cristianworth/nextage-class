# Verificação do 3A — Base do servidor

Entregue tecnicamente em 25/10/2026 na mudança establish-server-pilot-3a. Não é ainda um piloto com contas e dados persistidos: esses recortes seguem no 3B–3E.

## Evidências

- SDK .NET 10.0.402 e PostgreSQL 18.6 executados localmente, extraídos em work/toolchain. Banco fictício separado em work/postgres, porta 55432 e acesso somente local com senha aleatória, sem serviço global.
- Restore com packages.lock.json em modo travado e build C# aprovados, sem avisos/erros.
- Quatro testes HTTP aprovados: processo sem banco, prontidão com PostgreSQL real, conexão recusada sem detalhes privados e erro claro quando falta configuração. Nenhum teste ignorado.
- Conferência com API real em 127.0.0.1:5080: banco ativo retorna 200 nas duas verificações; após parar o banco, processo retorna 200 e prontidão 503 com somente status unavailable. Banco reiniciado e segunda inicialização preservam a configuração.
- 109 testes de domínio/persistência da demo, build React e formatação aprovados. O 2D acrescentou um cenário integrado aprovado aos 48 existentes; não houve alteração de interface nesta entrega.
- Formatação C#, requisitos OpenSpec e ausência de dados privados/gerados no Git conferidas.

## Avaliação e próximo passo

Não houve impedimento que exija decisão de produto no 3A. A falta de ferramentas foi resolvida com instalação local isolada. A revisão do roadmap mantém a ordem: contas/convites antes de expor operações de negócio. E-mail/senha e convite já foram aprovados por Cristian (DEC-56).

No 3B, testes de convite/recuperação usarão entrega fictícia local; envio externo dependerá do provedor definido para o 3E. Não há envio de mensagens para pessoas nesta entrega. Não usar dados reais antes de autorização por identidade e restauração verificada.
