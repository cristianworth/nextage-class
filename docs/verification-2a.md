# Verificação do 2A — Consulta do aluno

Entregue e verificado tecnicamente em 25/10/2026 na mudança `deliver-student-overview-2a`. Revisão de uso do 2A pendente. O aceite informado para o 1F pertence à etapa anterior.

## Resultado e chunks

| Chunk | Entrega técnica |
| --- | --- |
| A1 — Contrato de consulta | Campos permitidos explícitos por aluno, consultas públicas da agenda reutilizadas e exclusão de anotações reservadas |
| A2 — Entrada e próximas aulas | Ver como aluno, seleção fictícia, até seis próximos encontros, link próprio, retorno e estados vazios |
| A3 — Histórico e homework | Material utilizado preservado, situação da aula, nível registrado e tarefas em leitura; busca somente nos dados compartilhados |
| A4 — Revisão | Cronologia, recorrência/remarcação, troca entre alunos, recarga, ausência de gravação e conferência móvel |

Cristian confirmou o compartilhamento de material e homework. Conteúdo trabalhado/observações livres, motivo de falta, planejamento, telefone, ocupação e interesses não integram o contrato da tela. Não foi acrescentado um campo de resumo público ao lançamento.

A tela do aluno não recebe Workspace nem callbacks de gravação. O controlador da simulação oferece nomes fictícios para escolher a consulta, separado da área de leitura. Trocar o aluno reinicia a navegação e busca daquela tela, evitando informação visual residual.

## Evidências

- **94 testes de domínio/persistência aprovados** em onze arquivos, incluindo sete novos para campos permitidos, exclusão de dados, cronologia, snapshots, homework, recorrência/remarcação, cópias sem mutação, seleção inexistente e fuso de Brasília.
- **37 cenários completos de navegador aprovados**: 33 regressões e quatro novos da consulta do aluno.
- Verificados material anterior após editar catálogo, correção feita na professora refletida na consulta, busca sem usar texto reservado e ausência de controles de edição.
- Seleção de perfil, navegação, retorno e recarga não alteram o valor persistido. Recarregar começa na área da professora; a seleção da prévia fica apenas em memória.
- Build/TypeScript, formatação e OpenSpec estrito aprovados. Imagens de agenda/histórico em desktop e de consulta móvel 390 × 844 conferidas, sem largura excedente.
- Os testes usam contextos isolados na porta 4177. Não houve reset nem edição do armazenamento da prévia manual. Imagens e resultados ficam fora do Git.

## Para testar

1. Recarregar `http://127.0.0.1:5173/` e clicar em **Ver como aluno**.
2. Nas ferramentas da demo, escolher um aluno fictício. Conferir **Minhas aulas**, horário de Brasília e link próprio, se a professora o cadastrou.
3. Se não houver encontros futuros, agendar um na área da professora para experimentar; não é necessário reiniciar a demo.
4. Abrir **Meu histórico**. Conferir material utilizado e homework, sem o texto livre do lançamento ou botões para alterar a aula/correção.
5. Trocar o aluno e verificar que a consulta acompanha a seleção. Usar **Voltar à professora** para editar dados; a consulta passa a refletir essas alterações ao reabrir.
6. Conferir no celular. Ausência de aulas, registros, tarefas ou alunos deve apresentar mensagens claras.

## Limites e próximos recortes

A demo continua no formato local v5, sem dependências novas. O documento completo permanece no navegador; a escolha de aluno é uma ferramenta de simulação, não autenticação ou autorização real. O servidor deverá impor identidade e acesso no piloto.

O material usado numa aula anterior é consultado pela sua cópia histórica. Isso não abre o catálogo inteiro de níveis anteriores. A regra do acervo após mudança de nível ainda será decidida no **2B**. Solicitações e aprovação de horários pertencem ao **2C**; a revisão dos dois lados, ao **2D**.

As duas melhorias adiadas por Cristian — dispensa por aluno e vários materiais no encontro — permanecem apenas possibilidades futuras. O fluxo atual de andamento/conclusão e homework foi preservado. Ver [roadmap](roadmap.md).

Após organizar os estilos do botão de simulação na estrutura da professora, os dois cenários móveis (professora e aluno) foram repetidos e aprovados. Os requisitos do 2A foram sincronizados em openspec/specs/student-overview; a mudança permanece aberta para revisão de uso.
