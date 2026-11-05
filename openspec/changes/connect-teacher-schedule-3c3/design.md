# Design

- Tabelas no schema `app` para séries, segmentos, ocorrências gravadas e bloqueios. Ocorrências semanais usam a mesma identidade `weekly/{série}/{índice}` da demo. O índice sobrevive a mudanças de data e dia da semana.
- Uma transação de escrita obtém o lock da agenda única antes de ler o estado e mantém o lock até gravar. Leituras comuns recebem um snapshot coerente. A API consulta o perfil ativo e restringe a agenda à professora.
- Conflitos são interseções entre intervalos de hora e datas pontuais ou semanais. Datas de exceção são excluídas da regra original. O cálculo semanal usa a diferença de dias para localizar a primeira colisão, sem gerar semanas indefinidamente.
- Remarcações enviam as coordenadas vistas pela professora. Se outra aba já mudou essa ocorrência, a API recusa a gravação. Alterar o restante de uma série substitui exceções futuras, guarda as aulas que já começaram e conserva os segmentos anteriores.
- A aba Agenda do piloto reaproveita a grade e os formulários. A API envia as regras compactas e o navegador calcula as ocorrências da semana escolhida. O piloto exibe os dados do encontro e o link manual. Os controles de registro e preparação entram com a persistência desses dados no 3C4.
