# Sequência de aulas do material

Refinamento do 1C solicitado em 24/10/2026. Uma aula do material pode durar vários encontros da agenda. A professora informa o resultado no lançamento, quando sabe o que foi efetivamente trabalhado.

## Comportamento

- O acervo permite número de aula por nível, por exemplo A1 Unidade 1, Unidade 2 e Unidade 3. O número é inteiro positivo, único dentro do nível e pode ter lacunas. A ordem é numérica. Sem número, o material é complementar.
- O lançamento sugere o ponto atual do aluno e permite escolher outro conteúdo trabalhado. Sem progresso anterior, começa na primeira aula numerada disponível do nível. Sem sequência, conserva a sugestão do planejamento opcional por encontro.
- A marcação **Concluí esta unidade** fica desmarcada por padrão. Manter em andamento sugere o mesmo conteúdo no encontro seguinte; concluir sugere o próximo disponível.
- A aula trabalhada fica copiada no histórico e não é substituída pela próxima. Exemplo: quinta trabalhou e concluiu Unidade 3; o histórico guarda Unidade 3 concluída e continuidade Unidade 4.
- Faltas e material complementar não avançam nem apagam o progresso anterior. Assuntos adicionais continuam no conteúdo trabalhado, sem exigir concluir a aula do material.
- Última aula concluída indica fim da sequência, sem mudar o nível automaticamente. Acrescentar uma aula posterior ao acervo permite retomá-la. Uma continuidade que mudou de nível/saiu da sequência exige seleção explícita.

## Histórico e consulta

O resultado pedagógico pertence ao registro, separado da cópia do material utilizado. A consulta ordena pela data/hora efetiva dos encontros, por aluno e nível. Edição de um encontro antigo não passa a ser o progresso atual quando já há encontro posterior. Consultar uma aula antiga considera somente encontros anteriores.

Correções de texto ou homework preservam o resultado anterior; trocar material/situação explicitamente o atualiza. Referência de continuidade guarda título, nível e número para não reescrever a leitura histórica quando o acervo muda. Não existe um ponteiro de progresso atualizado por ordem de salvamento.

## Compatibilidade

Formato local v4, mantendo a chave do navegador. Dados válidos de v1/v2/v3 migram em memória e só são persistidos na próxima alteração salva. Materiais antigos ficam sem número, e registros antigos não recebem conclusão presumida. Agenda, planos, cópias históricas e homework são preservados.

Para um acervo existente, editar os materiais e informar seus números dentro do nível. No primeiro lançamento da sequência, selecionar o ponto real em que o aluno está; não é necessário lançar todo o passado. Demo nova contém nove textos próprios, incluindo quatro aulas numeradas de A1. Demais exemplos são complementares.

Este incremento não adiciona hierarquia de livros/módulos, mudança automática de nível, exclusão de materiais, portal ou backend. Planejamento por encontro continua disponível como complemento.

## Verificação técnica em 24/10/2026

- 71 testes de domínio/persistência aprovados: 62 anteriores e nove novos para sequência, repetição/conclusão, cronologia, isolamento, fim, numeração/integridade e migração v3.
- 23 cenários de navegador aprovados: 19 anteriores e quatro novos para Unidade 3 em dois encontros, retomada após edição antiga, falha ao salvar sem avanço, migração v3 e uso móvel com rejeição de número duplicado.
- Após os ajustes finais de seleção, os quatro cenários novos foram repetidos e aprovados. Build/TypeScript, formatação e validação OpenSpec estrita aprovados.
- Conferidas imagens locais de lançamento em computador e celular, incluindo conteúdo trabalhado e próxima sugestão distintos. Imagens/resultados continuam ignorados no Git.
- Revisão de uso com Cristian e a professora continua pendente; os testes não representam aceite humano da rotina.

## Para conferir na demo

1. No acervo existente, editar os materiais do nível e preencher **Número da unidade**, por exemplo 3 e 4. Sem número, o item continua complementar; um número repetido no mesmo nível é recusado.
2. Abrir o lançamento de um encontro encerrado, selecionar a Unidade 3 e salvar sem marcar **Concluí esta unidade**. No próximo encontro, ela deve vir preenchida novamente.
3. Lançar o segundo encontro ainda com Unidade 3 e marcar a conclusão. O próximo encontro deve sugerir Unidade 4, enquanto o histórico do segundo continua mostrando Unidade 3 concluída e continuidade Unidade 4.
4. Recarregar, conferir **Conteúdo atual** na lista de alunos e editar o texto do primeiro encontro. A sugestão atual deve continuar na Unidade 4.
5. Uma demo nova traz A1 Unidades 1–4 para a aluna fictícia Sofia. Em dados existentes, usar **Acervo → Adicionar exemplos**, sem reiniciar a demo. Ver os ajustes de nível, filtro e histórico no [1D](verification-1d.md).
