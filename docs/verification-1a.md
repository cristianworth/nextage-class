# Verificação da entrega 1A

Data: 23/10/2026. Mudança: `deliver-teacher-demo-1a`. Versão inicial da interface: 0.1.0.

## Evidências técnicas

- Build de produção e verificação TypeScript concluídos.
- 33 testes de domínio/persistência aprovados: cadastro, conflitos, grade, datas/fuso, registro único, snapshots, leitura inválida e falhas de armazenamento.
- 8 cenários de navegador aprovados em Microsoft Edge pelo Playwright: fluxo completo, lançamento futuro bloqueado, falta sem motivo, corrupção/reset confirmado, falha ao gravar, pesquisa/filtro vazio, navegação semanal e consulta móvel.
- Testes usam o relógio de 23/10/2026 às 12h de São Paulo e um navegador em outro fuso para verificar que o produto mantém sua referência de horário.
- Capturas de agenda em 1440px e 390px e alunos em 390px conferidas visualmente. Artefatos temporários ficam fora do Git em `work/` e `web/test-results/`.
- Artefatos OpenSpec validados em modo estrito. Revisão de uso com Cristian/professora ainda não realizada.

## Para experimentar

1. Executar conforme [local-development.md](local-development.md).
2. Em **Alunos**, cadastrar nome e nível; deixar os campos complementares vazios se preferir.
3. Em **Agenda**, criar uma aula desse aluno em dia útil. Para lançar imediatamente, escolher uma data passada ou um horário de hoje cujo término já ocorreu.
4. Tentar criar outra aula no mesmo bloco: deve informar conflito e manter a primeira.
5. Abrir a aula e lançar presença com conteúdo ou falta com motivo opcional.
6. Em **Histórico**, filtrar pelo aluno, editar o registro e conferir que continua existindo apenas um registro para a aula.
7. Recarregar e conferir os dados. Editar o nível do aluno não deve alterar o nível histórico.
8. Em **Reiniciar demo**, cancelar para preservar os dados ou confirmar para restaurar os exemplos.

## Limitações conhecidas

- Demo fictícia com armazenamento no navegador: sem contas, backup, sincronização ou resolução de alterações entre abas.
- Apenas aulas pontuais. Não há exclusão, recorrência, bloqueios ou remarcação no 1A.
- Material em texto livre; acervo e homework pertencem ao 1C.
- Todos os registros são consultados pela professora nesta demo. Visibilidade para alunos será decidida na fase do portal.
- Dados iniciais variam com a semana de referência até a primeira alteração ser salva; alterações salvas permanecem estáveis após recarregar.
