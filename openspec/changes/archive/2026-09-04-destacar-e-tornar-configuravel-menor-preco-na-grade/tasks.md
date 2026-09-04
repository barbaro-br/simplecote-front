## 1. Toggle em Configurações

- [x] 1.1 Adicionar campo `destacarMenorPrecoNaGrade` (boolean, default `true`) ao schema/mock de Configurações (`configuracoes.schema.ts`, `configuracoes.api.ts`), no mesmo padrão de `tema`/`estiloNavegacao`.
- [x] 1.2 Adicionar o controle (toggle/radio ligado-desligado) "Destacar menor preço na grade ao vivo" na tela de Configurações, com texto de ajuda curto.
- [x] 1.3 Garantir que salvar a preferência funciona e que ela é lida corretamente ao carregar a tela de Configurações.

## 2. Aplicar a preferência na Grade ao Vivo

- [x] 2.1 Ler a preferência `destacarMenorPrecoNaGrade` (via `useConfiguracaoLoja()` ou hook equivalente) no componente da Grade ao Vivo.
- [x] 2.2 Revisar a condição atual de destaque (`ehMenor` ou equivalente) e confirmar/corrigir que ela já cobre corretamente o caso de item com um único lance `COTADO` — hoje a comparação `precoUnitario === menorPrecoUnitario` deveria bastar; investigar por que o destaque não apareceu de forma confiável em uso real (possível causa: dado momentaneamente desatualizado entre o autosave do admin e a atualização via SSE/refetch da grade) e corrigir a causa raiz se for esse o caso.
- [x] 2.3 Aplicar a preferência: quando desligada, nunca aplicar a classe/estilo de destaque, mesmo que a célula seja o menor preço.
- [x] 2.4 Testes: item com 1 lance recebe destaque quando ligado; nenhuma célula recebe destaque quando desligado; comportamento com múltiplos lances continua igual ao atual quando ligado.
