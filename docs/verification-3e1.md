# 3E1 — Ensaio local de recuperação

Em 08/11/2026, o primeiro recorte do 3E preparou um ensaio de backup e restauração para dados **fictícios** no PostgreSQL local. O [inventário](pilot-recovery-inventory.md) separa os dados e vínculos do schema da aplicação das identidades e configurações do Supabase Auth. Recuperar esses dados locais não prova recuperação de identidades, segredos ou operação hospedada.

## Como executar novamente

```powershell
./scripts/start-local-database.ps1
./scripts/test-recovery.ps1
```

O teste cria bancos de origem e destino novos, popula uma fixture fictícia, chama [recover-test-database.ps1](../scripts/recover-test-database.ps1), restaura e compara conteúdo e contagem de treze tabelas. Verifica também que a origem não muda, que o destino já existente ou ausente e a origem igual ao destino são recusados, que não é permitido usar o banco de desenvolvimento como origem e que cópia inválida não é aceita. Os bancos e arquivos **fictícios** criados pelo ensaio permanecem na instância local e em `work/recovery` para inspeção; o teste não apaga dados automaticamente.

Para ensaio manual, a ferramenta exige origem local de teste identificada, arquivo `.dump` com nome simples em `work/recovery` e, na restauração, destino novo `nextage_class_recovery_*tests`. A ferramenta não sobrescreve arquivo ou banco existente. Se uma restauração falhar depois de criar o destino, o banco isolado pode estar incompleto e não deve ser usado até ser examinado.

## Evidências e limites

- O teste passou duas vezes em 08/11/2026; a segunda execução incluiu as recusas adicionais e comparou as treze tabelas após restaurar. A fixture contém aluno e vínculo, sequência e unidade, série e remarcação, planejamento, registro com cópia histórica, homework, progresso e pedido.
- A compilação isolada da API passou com zero erros. O ensaio não modificou o banco de desenvolvimento nem conectou ou alterou o Supabase hospedado.
- Os dumps em `work/recovery` são arquivos locais sem mecanismo de criptografia fornecido por esta ferramenta. São apropriados apenas para a fixture fictícia, não para dados reais. Não estabelecem política de retenção, backup hospedado, recuperação de Auth, perda máxima ou tempo de recuperação.
- B4 real e as decisões operacionais de 3E seguem pendentes. O procedimento não publica, envia mensagens nem altera contas. A revisão pessoal da documentação é opcional.