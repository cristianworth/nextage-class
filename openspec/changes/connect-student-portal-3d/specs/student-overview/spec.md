## ADDED Requirements

### Requirement: Consulta autenticada da própria rotina
O piloto SHALL derivar o aluno consultado do vínculo ativo da identidade autenticada e fornecer suas próximas aulas e histórico compartilhado segundo os contratos existentes. Não SHALL aceitar uma identidade de aluno enviada pelo cliente como autoridade.

#### Scenario: Identidade não corresponde ao aluno solicitado
- **WHEN** uma identidade de aluno tenta informar ou consultar outro aluno
- **THEN** a resposta não contém dados do outro aluno e nenhuma troca de vínculo ocorre.

#### Scenario: Aulas e histórico após recarga
- **WHEN** o aluno entra e recarrega a consulta
- **THEN** vê suas próximas aulas efetivas e seus registros compartilhados persistidos, incluindo material histórico e situação do homework.

### Requirement: Projeção segura da rotina
As respostas da consulta do aluno SHALL excluir anotações livres da aula, motivo de falta, planejamento, dados complementares e informações de outros alunos. Operações administrativas SHALL permanecer inacessíveis ao aluno.

#### Scenario: Registro contém informações reservadas
- **WHEN** o registro consultado contém anotações ou motivo privado e há um plano de preparação
- **THEN** esses valores e campos não são enviados ao cliente do aluno.

#### Scenario: Perfil sem autorização
- **WHEN** o token é inválido ou o perfil está ausente, inativo ou sem vínculo válido
- **THEN** a consulta é negada sem revelar dados protegidos.
