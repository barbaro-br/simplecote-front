## 1. Corrigir a heurística

- [x] 1.1 Em `CotacaoPorTokenPage.tsx`: criar um `useRef<Set<string> | null>(null)` (ex.: `idsConhecidosRef`). No primeiro `cotacao.data` que chega (mesmo ponto onde hoje se popula `fonteSemeada`/`temPrecoLocal`), se `idsConhecidosRef.current` ainda é `null`, preenchê-lo com o `Set` dos `itemCotacaoId` de `cotacao.data.itens`. Não sobrescrever em cargas seguintes.
- [x] 1.2 Em `cotacao-token.derivados.ts`: mudar a assinatura de `itemEhNovo(item, todosItens)` para `itemEhNovo(item, idsConhecidos: Set<string>)`, retornando `!idsConhecidos.has(item.itemCotacaoId)`. Remover a lógica antiga baseada em `statusLance`.
- [x] 1.3 Atualizar a chamada em `CotacaoPorTokenPage.tsx` (onde hoje passa `itemEhNovo(item, d.itens)` pro `ItemLanceCard`) para passar `idsConhecidosRef.current` no lugar de `d.itens`.

## 2. Testes

- [x] 2.1 Teste: cotação com 2+ itens carregados juntos, representante preenche o preço de um item — nenhum dos outros itens (presentes desde o carregamento inicial) fica marcado "Novo".
- [x] 2.2 Teste: item cujo id não estava no primeiro carregamento (simular um refetch que traz um item novo) é marcado "Novo".
- [x] 2.3 Teste: primeiro carregamento nunca marca nada como novo, independente do `statusLance` inicial dos itens.
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões, incluindo os testes existentes de `ItemLanceCard`/`CotacaoPorTokenPage` que cobrem o indicador "Novo".

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): criar uma cotação ABERTA com 2+ itens, responder um item pelo link do representante e confirmar visualmente que os demais não ganham o badge "Novo".
- [ ] 3.2 Testar o caso verdadeiro-positivo: com a cotação já aberta e respondida parcialmente, adicionar um item pelo admin (`AdicionarItemModal`) e confirmar que ele aparece com "Novo" na próxima atualização da tela do representante.
