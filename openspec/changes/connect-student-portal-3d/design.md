# Design

## Context

Ver [proposta](proposal.md). `CurrentAccess` resolve o perfil ativo e já existe política `Student`, mas `PilotApp` ainda apresenta somente confirmação de acesso para esse papel. Rotas de agenda, catálogo, registros e planos exigem `Teacher` e retornam dados administrativos. A demo já tem projeções explícitas em `student-overview.ts` e `student-library.ts`, além das regras de pedidos. A agenda do servidor usa o lock transacional `nextage-class:teacher-schedule` e representa semanais por série, índice, segmentos e exceções.

## Goals / Non-Goals

**Goals:** contratos mínimos por identidade, mesma regra de produto da demo, isolamento verificável e pedidos/decisões consistentes sob concorrência.

**Non-Goals:** alterar regras pedagógicas, importar a demo, criar identidade real, reenviar convites, alterar Supabase hospedado, implantar o piloto ou encerrar B4/3E com mocks.

## Decisions

1. **Identidade e projeções próprias.** Rotas do aluno usam a política `Student` e obtêm `StudentId` do `CurrentAccess` ativo; consultas filtram no servidor e constroem DTOs explícitos com lista de campos permitidos. Não aceitar ID arbitrário como autoridade nem retornar DTOs administrativos para a interface ocultar campos. Alternativa de reutilizar diretamente `ScheduleData`, registros ou catálogo teacher descartada porque inclui dados de outros alunos e campos reservados. JWT e claims editáveis não substituem o perfil no banco.
2. **Aulas e histórico.** Projetar até seis ocorrências futuras efetivas do vínculo, respeitando remarcações e Brasília; histórico próprio decrescente expõe somente situação, nível, material/cópia e homework. Resolver recorrências por contratos públicos da agenda, sem copiar cálculo nem carregar a agenda administrativa no cliente. Usar relógio injetável em testes e evitar expansão infinita de série.
3. **Acervo e continuidade.** Filtrar no servidor pelo nível atual, construir o estado reduzido de sequência principal e reutilizar a regra cronológica por aluno/livro. Não expor conteúdo incompatível, registros internos ou notas para calcular no navegador. A leitura não grava. A identificação e o contrato público para compartilhar a regra entre API e demo devem ser definidos no primeiro recorte de implementação sem criar dependência entre runtimes.
4. **Pedidos e disponibilidade.** Persistir pedidos no schema privado com restrições, vínculo de aluno, tipo, início, término opcional e status. A consulta recebe parâmetros de período, não dados de aluno, e retorna somente horários; conflitos internos nunca devolvem nomes ou motivos. Reusar as regras de intervalo da agenda por uma fronteira pública de domínio. Comparar séries sem limite artificial, inclusive conflitos distantes.
5. **Atomicidade.** Criação de pedido valida estado e disponibilidade sob coordenação adequada, impede duplicatas pendentes do mesmo aluno e não reserva. Na decisão, adquirir o mesmo lock transacional da agenda antes de ler/revalidar; registrar decisão e criar a aula/série na mesma transação. Dois alunos podem solicitar o mesmo horário, mas aprovações concorrentes conflitantes não criam duplicata. Recusa e repetição de decisão não alteram agenda. Mensagens públicas de disponibilidade não propagam descrições privadas de conflito.
6. **Interface e testes.** Adaptar `StudentPortal`/`StudentLibrary` a modelos reduzidos de servidor, mantendo a demo intacta. Isolar a sessão, limpar contexto ao sair/trocar conta e ignorar respostas atrasadas. Cobrir dois alunos fictícios, perfil inativo/ausente, teacher, anônimo, JWT assinado, API/PostgreSQL real, concorrência e navegador em computador/celular. Simular somente identidade nos percursos integrados; não enviar e-mail.

## Risks / Trade-offs

- Exposição por projeção incompleta → afirmar exclusão dos campos no JSON, inclusive em erros e respostas manipuladas; testar acesso cruzado e negar rotas administrativas.
- Expansão ilimitada de série → consultar somente janela necessária para próximas aulas e usar aritmética de intervalos para disponibilidade semanal integral.
- Corrida entre aprovação e agenda → lock compartilhado, leitura após lock, restrições no banco e testes de concorrência com rollback.
- Dados do catálogo/progresso mudam entre consultas → usar transação de leitura consistente quando necessário e validar nível/vínculo no servidor a cada solicitação.
- Ajustes de interface já relatados no histórico/menu → continuam registrados no roadmap para acabamento, sem transformar esta proposta em redesign.

## Migration Plan

Adicionar migrações locais não destrutivas somente para persistência necessária dos pedidos; preservar schema privado/RLS e dados atuais. Testar aplicação repetida e preservação em `nextage_class_tests` antes de desenvolvimento local, com backup prévio. Não aplicar no projeto hospedado nesta mudança sem autorização específica. Para recuo antes do uso real, desativar rotas/interface novas preservando dados e migrações; qualquer restauração ou remoção de pedidos exige plano e autorização próprios.
