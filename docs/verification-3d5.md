# 3D5 — Integração do portal

O percurso integrado usa navegador Edge, API e PostgreSQL locais de teste com duas identidades fictícias. A professora prepara conteúdo e registra uma aula; cada aluno acessa sua própria área. Eles podem pedir o mesmo horário sem reserva; ao aprovar um pedido, a professora recebe conflito ao tentar aprovar o outro, que continua pendente. O aluno aprovado vê a decisão e a aula após recarga.

O segundo aluno tem nível diferente. O percurso verifica que seu histórico e seu acervo não exibem o homework ou o material restrito ao primeiro, que observações privadas não aparecem na resposta, e que aluno não acessa rotas da professora. Nenhuma conta real ou e-mail foi criado.
## Evidências novas

- Dois percursos em computador e celular passaram com API e PostgreSQL reais de teste, emissão de identidade simulada, dois alunos, recarga, conflito e isolamento. Na primeira tentativa, o seletor encontrou fixtures homônimas entre os formatos; os nomes foram separados e ambos os percursos foram repetidos com sucesso.
- 48 testes de API em banco isolado, 130 testes de frontend e 49 cenários de navegador da demo passaram. Builds do piloto e da demo pública e validação estrita OpenSpec passaram.
- A API local respondeu pronta e o piloto acessível. Não foi necessária migração nem houve criação de conta real, envio de e-mail ou alteração do ambiente hospedado.

A implementação local do 3D está concluída tecnicamente; a revisão pessoal é opcional e fica em [Pendente de Teste](pending-human-testing.md). Recuperação e acesso real do aluno no B4 continuam necessários, assim como as decisões e verificações operacionais do 3E antes do uso real.
