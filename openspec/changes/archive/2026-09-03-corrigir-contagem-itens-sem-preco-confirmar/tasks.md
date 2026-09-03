## 1. Corrigir o semeio de `temPrecoLocal`

- [x] 1.1 Em `CotacaoPorTokenPage.tsx`: trocar a substituição total de `temPrecoLocal` (linhas ~54-58) por uma mesclagem — usar a forma funcional de `setTemPrecoLocal(prev => ...)` para adicionar só as entradas de `cotacao.data.itens` cujo `itemCotacaoId` ainda não existe em `prev`, preservando qualquer entrada já presente (seja de edição do representante, seja de um semeio anterior).
- [x] 1.2 Conferir que o primeiro carregamento (quando `temPrecoLocal` ainda é `null`) continua semeando normalmente a partir de todos os itens (sem regressão no caso base).

## 2. Testes

- [x] 2.1 Teste: simular uma segunda resposta da query (refetch) com um item que já foi marcado localmente como "com preço" — a contagem local desse item continua `true` mesmo se o refetch trouxer `preco: null` para ele.
- [x] 2.2 Teste: um item novo trazido por um refetch (não presente na primeira carga) entra corretamente no `temPrecoLocal` como "sem preço".
- [x] 2.3 Teste: primeiro carregamento continua semeando a contagem inicial corretamente a partir de `d.itens`.
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): abrir a cotação pelo link do representante em duas abas com o mesmo token, precificar um item numa aba, forçar um refresh/refoco na mesma aba logo em seguida, e confirmar que a contagem "N de T" e o modal de confirmação não retrocedem.
