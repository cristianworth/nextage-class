# Tasks

## E1 — Recuperação local isolada

- [ ] 1.1 Inventariar dados e configurações necessários à recuperação: tabelas `app`, migrações, vínculos, identidades/Auth, segredos e configurações; distinguir o que uma cópia PostgreSQL cobre e o que depende do provedor. Definir dados fictícios e destino isolado sem substituir banco existente.
- [ ] 1.2 Preparar procedimento ou ferramenta mínima de cópia e restauração local que identifique origem e destino, recuse origem igual ou destino não identificado, preserve credenciais fora de logs/Git e apresente falhas; não sobrescrever destino existente sem autorização.
- [ ] 1.3 Restaurar dados fictícios em banco isolado, comparar alunos, vínculos, agenda, exceções, registros e cópias históricas, materiais, progresso e pedidos; testar cópia inválida e recusa de destino perigoso; registrar evidências e verificar que a origem permaneceu intacta.

## E2 — Acabamento do piloto

- [ ] 2.1 Reproduzir e corrigir transbordamento de descrições no histórico, incluindo palavras longas e preservação do conteúdo salvo; verificar computador e celular.
- [ ] 2.2 Comparar e organizar menu do piloto conforme a demo, verificando acessibilidade, estados e navegação em computador/celular; executar testes relevantes e registrar evidências. A revisão pessoal de uso é opcional.

## E3 — Desenho de operação e implantação

- [ ] 3.1 Comparar opções atuais para API .NET, frontend, domínio, HTTPS, proxy `/api`, e-mail e banco já escolhido; apresentar custos e limites verificados, sem assumir contratação ou publicação. Alinhar com Cristian orçamento, disponibilidade e escolha antes de depender de fornecedor.
- [ ] 3.2 Preparar configuração e roteiro para a opção aprovada, com segredos externos, ambientes separados, observabilidade mínima, migrações, backup anterior, verificação e recuo; validar localmente ou em ambiente autorizado, sem publicar por inferência.
- [ ] 3.3 Definir com Cristian responsável, destino protegido, frequência, retenção, perda aceitável e tempo de recuperação; validar procedimento adequado ao ambiente aprovado, incluindo limites de recuperação de Auth/configuração. Não restaurar sobre dados existentes sem autorização específica.

## E4 — B4 real e envio

- [ ] 4.1 Conferir projeto correto, cadastro público, redirecionamentos e restrições atuais de SMTP; documentar estado observado sem alterar configurações. Alinhar identidade e destinatário antes de qualquer conta ou mensagem.
- [ ] 4.2 Após autorização por ação, configurar o envio escolhido e verificar recebimento, ativação, entrada/saída, permissões e recuperação reais de professora/aluno conforme aplicável; registrar evidências sem senhas, tokens ou conteúdo de mensagens. Não declarar B4 completo antes dos resultados reais.

## E5 — Integração e liberação

- [ ] 5.1 Verificar em ambiente autorizado frontend → API → banco/Auth, isolamento, HTTPS, falhas, disponibilidade e recuperação; preservar a demo pública e comparar a situação das migrações antes de qualquer aplicação hospedada autorizada.
- [ ] 5.2 Atualizar roadmap, evidências, operação e lista de revisões pessoais; reunir as validações reais pendentes e apresentar prontidão e riscos antes de dados reais. Implantação, contratação, migração hospedada e envio externo dependem de autorizações específicas.