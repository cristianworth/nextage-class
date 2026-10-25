# Verificação do 2B — Acervo do aluno

Entregue e verificado tecnicamente em 25/10/2026 na mudança `deliver-student-library-2b`. Revisão de uso de 2A/2B permanece pendente; o aceite informado para o 1F pertence à etapa anterior.

## Resultado e chunks

| Chunk | Entrega técnica |
| --- | --- |
| B1 — Consulta compatível | Contrato por aluno, somente nível atual, herança de níveis por sequência, apoios compartilhados e continuidade própria |
| B2 — Meu acervo | Unidades agrupadas por sequência, apoios, busca/tipo, sugestão e painel de leitura sem edição |
| B3 — Revisão | Promoção, histórico preservado, conteúdo literal, ordem numérica, troca de contexto, recarga, celular e regressões |

Cristian confirmou que o aluno acessa o acervo do nível atual; os materiais de níveis anteriores já utilizados ficam disponíveis pelas cópias do histórico. O filtro não exige uso anterior do material nem limita a consulta à sequência principal.

Abrir texto não marca lido/concluído, não avança progresso e não altera homework. A sugestão usa as mesmas regras do lançamento: unidade em andamento, próxima após conclusão e fim da sequência disponível sem presumir conclusão das omitidas. Principal ausente, vazio ou indisponível têm mensagens próprias.

## Evidências

- **101 testes de domínio/persistência aprovados** em doze arquivos, incluindo sete novos para filtro atual, múltiplos níveis, herança, ordenação 2/10, conteúdo além do principal, andamento/fim, promoção, vazios e cópias sem mutação.
- **41 cenários de navegador aprovados**: 37 regressões e quatro novos do acervo do aluno.
- Verificados leitura de material nunca utilizado, busca/tipo, acesso a apoio compartilhado sem duplicação e exclusão de conteúdo incompatível.
- Promoção A1 → A2 retira A1 do catálogo; o histórico preserva o texto registrado, mesmo após editar o catálogo. Conteúdo/observações livres continuam reservados.
- Texto com marcação HTML aparece literalmente, sem criar imagem nem executar seu conteúdo.
- Busca, filtros, abertura/fechamento e troca de aluno preservam o valor armazenado. A troca descarta leitura, filtros e busca do perfil anterior.
- Build/TypeScript, formatação e OpenSpec estrito aprovados. Conferidas imagens de computador e leitura móvel 390 × 844, sem largura excedente.
- Testes usam contextos isolados na porta 4177; o armazenamento da prévia manual não foi reiniciado nem editado. Imagens e resultados ficam fora do Git.

## Para testar

1. Recarregar `http://127.0.0.1:5173/`, abrir **Ver como aluno** e selecionar um aluno fictício.
2. Abrir **Meu acervo**. Sofia A1 tem unidades e apoio nos exemplos atuais; Lara A2 tem apoio A2. Conteúdo existente não é substituído automaticamente; exemplos ausentes podem ser acrescentados pela área da professora em **Acervo → Adicionar exemplos**.
3. Pesquisar uma unidade, sequência ou termo do texto; filtrar Unidades/Materiais de apoio. Abrir **Ler material** e depois **Fechar leitura**, ou usar Escape no painel.
4. Conferir a sugestão da sequência principal. A professora atualiza o ponto no lançamento; a leitura pelo aluno não muda esse resultado.
5. Trocar o aluno durante uma leitura e reabrir Meu acervo: o contexto anterior deve desaparecer.
6. Para experimentar promoção, registrar material A1 para um aluno e depois mudar seu nível para A2. A aba segue A2, e a cópia A1 continua em Meu histórico.

## Limites e próximos recortes

O documento local continua v5, sem migração adicional ou dependências novas. A seleção de aluno é uma ferramenta de simulação; o navegador mantém a base completa e não oferece autenticação/autorização reais. O piloto deverá impor identidade e acesso no servidor.

Não foram adicionados edição pelo aluno, marcação de leitura/conclusão, novos recursos de homework, dispensa individual ou vários materiais por encontro. Solicitações pertencem ao **2C** e dependem da definição de avulsa/recorrente e aprovação; a revisão dos dois lados permanece no **2D**. Ver [roadmap](roadmap.md).
