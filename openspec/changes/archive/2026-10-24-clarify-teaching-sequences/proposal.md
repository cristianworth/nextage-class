# Proposal

## Why

Após o aceite do 1F por Nara, Cristian esclareceu que a sequência pode conter aulas autorais, e não apenas um livro. Apoios já são selecionáveis, mas os nomes e a demo A1 deixam essa possibilidade pouco clara.

## What Changes

- Usar sequência didática na interface para livros e conteúdo autoral, preservando dados e identificadores existentes.
- Separar unidades e apoios visualmente no seletor de conteúdo; acrescentar um apoio A1 fictício aos exemplos, sem reset.
- Explicitar e verificar seleção fora da ordem e retomada: escolher Unidade 3 não conclui Unidade 2 nem a remove do acervo.
- Registrar aceite do 1F, organizar documentação atual versus evidências históricas e consolidar requisitos entregues.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `book-catalog`: sequência didática representa livro ou aulas autorais.
- `lesson-history`: unidades e materiais de apoio reconhecíveis no lançamento.
- `course-progress`: percurso flexível, sem conclusão presumida de unidades omitidas.

## Impact

Textos, apresentação do catálogo/lançamento, exemplos e testes. Sem novo formato local, recursos de homework, currículo individual persistido, vários materiais por registro ou mudanças na stack. Recursos maiores ficam como propostas posteriores.
