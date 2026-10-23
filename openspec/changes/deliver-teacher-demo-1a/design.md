# Design

## Context

Projeto novo e documental; ver `proposal.md` para a motivação. O 1A precisa ser uma fatia completa e local, mantendo espaço para o backend posterior sem criar contratos fictícios de API.

## Goals / Non-Goals

**Goals:** separar componentes, operações de domínio e armazenamento; preservar histórico; oferecer interface responsiva e verificações reproduzíveis.

**Non-Goals:** API, login, recorrência, remarcação, homework e catálogo completo não entram no código deste incremento.

## Decisions

- React/TypeScript/Vite em `web/`; ferramentas OpenSpec no pacote privado da raiz. Instalação local com versão fixada e lockfiles, evitando modificar instalações globais.
- `src/domain/` contém tipos, datas, dados fictícios e operações puras. `src/data/` valida e persiste o estado local; `src/features/` contém telas/formulários; `src/app/` compõe a navegação. Sem camada de repositório genérica ou gerenciador de estado externo.
- Um documento local versionado mantém alunos, aulas pontuais e registros separados por identidade. Validar dados na leitura; salvar antes de atualizar o estado visível. Dados inválidos bloqueiam edição até reset explícito. Falha de gravação mantém o formulário e o estado anterior.
- Datas de aula são strings civis `YYYY-MM-DD`; cálculos de semana/dia usam funções puras, sem converter a data civil pela zona do navegador. Agora/hoje vêm de `America/Sao_Paulo`. O bloco reserva 60 minutos e termina pedagogicamente após 55.
- Um registro por aula, com snapshots de nome/nível/material, `createdAt` e `updatedAt`. Editar aluno não reescreve snapshots. Material é texto livre até o 1C.
- Cadastro mínimo: nome/nível; início das aulas assume hoje e pode ser alterado. Campos complementares opcionais. Não há exclusão de alunos/aulas neste recorte.
- Interface clara em português, navegação por agenda/alunos/histórico, grade semanal e alternativa diária móvel. Formulários em diálogos nativos com rótulos acessíveis e mensagens claras. Nenhum dado real ou acervo de terceiros nos exemplos.
- Vitest cobre domínio/persistência. Playwright cobre criação, conflito, lançamento/edição, recarga, reset, dados inválidos e uma tela móvel. Testes fixam a referência temporal quando necessário.

## Risks / Trade-offs

- Armazenamento local pode ser apagado ou indisponível → identificar demo, tratar erro e exigir confirmação no reset.
- Datas/fusos podem divergir → fuso único e funções testáveis; não usar parsing UTC implícito de data civil na apresentação.
- O conteúdo pode ficar grande no futuro → localStorage é suficiente para texto fictício no 1A; reavaliar no acervo e no backend.
- Ainda não há confirmação visual da professora → registrar validação técnica separadamente da revisão de uso, que permanece pendente.

## Migration Plan

Executar localmente; build estático para revisão, sem publicar. Dados têm versão de schema; versões desconhecidas não serão migradas ou sobrescritas silenciosamente. O backend futuro terá desenho próprio.
