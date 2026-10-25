# student-library Specification

## Purpose

Disponibilizar ao aluno a leitura de unidades e materiais de apoio compatíveis com seu nível atual, com continuidade da sequência principal e histórico preservado.

## Requirements

### Requirement: Acervo compatível com o nível atual
A consulta SHALL oferecer todo o acervo compatível com o nível atual do aluno, incluindo unidades de sequências e apoios com vários níveis. Não SHALL exigir uso anterior em aula ou selecionar somente a sequência principal. Seleção inexistente SHALL retornar ausência de dados.

#### Scenario: Material ainda não utilizado
- **WHEN** existe uma unidade ou apoio compatível que nunca foi usado nas aulas do aluno
- **THEN** esse conteúdo pode ser consultado sem liberar materiais incompatíveis.

#### Scenario: Mudança de nível
- **WHEN** o aluno passa de A1 para A2
- **THEN** Meu acervo mostra apenas conteúdo compatível com A2; cópias de materiais A1 já utilizados permanecem no histórico.

### Requirement: Continuidade da sequência principal
A consulta SHALL apresentar a unidade sugerida pelas mesmas regras usadas pela professora. SHALL distinguir ausência de principal, sequência vazia, fim disponível e referência indisponível. Não SHALL presumir leitura ou conclusão das unidades omitidas nem usar progresso de outro aluno.

#### Scenario: Unidade em dois encontros
- **WHEN** a professora registra Unidade 3 em andamento e depois a conclui
- **THEN** a consulta sugere a mesma unidade enquanto em andamento e a próxima disponível após a conclusão.

#### Scenario: Principal incompatível
- **WHEN** o principal deixa de atender o nível atual
- **THEN** não oferece sua unidade como sugestão nem expõe o conteúdo incompatível, informando que a professora precisa ajustar a sequência.

### Requirement: Consulta e leitura sem edição
Meu acervo SHALL permitir pesquisar título/texto/sequência, filtrar unidades ou apoios, ordenar unidades numericamente e abrir o texto completo. Não SHALL oferecer cadastro, edição ou marcação de lido/conclusão. Abertura, fechamento e busca SHALL não gravar ou alterar progresso/homework.

#### Scenario: Ler sem avançar
- **WHEN** o aluno abre e fecha um material e navega pelo acervo
- **THEN** o texto é mostrado com segurança como texto, sem mudar dados locais, sugestão de continuidade ou situação do homework.

### Requirement: Contrato reduzido e troca de contexto
A tela SHALL receber apenas campos permitidos do catálogo e continuidade do próprio aluno. Não SHALL receber registros, planos, notas reservadas ou dados de outros alunos. Trocar o aluno SHALL descartar busca, filtros e leitura abertos do contexto anterior; vazios SHALL ter mensagens claras.

#### Scenario: Trocar aluno durante leitura
- **WHEN** um material está aberto e a simulação muda de aluno
- **THEN** a consulta anterior é descartada e somente o acervo do aluno atual pode ser aberto.
