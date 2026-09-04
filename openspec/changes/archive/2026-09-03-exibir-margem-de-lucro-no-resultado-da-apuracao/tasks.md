## 1. Estado e cálculo

- [x] 1.1 Em `ResultadoPage.tsx`: adicionar `const [margemGlobal, setMargemGlobal] = useState('')` e `const [margensPorItem, setMargensPorItem] = useState<Record<string, string>>({})`.
- [x] 1.2 Criar uma função pura `precoDeVenda(precoCusto: number, margemStr: string): number | null` — parseia `margemStr` (aceita vírgula e ponto), retorna `null` se vazio/inválido/negativo, senão `precoCusto * (1 + valor / 100)`.
- [x] 1.3 Criar um helper `margemEfetiva(itemId: string): string` retornando `margensPorItem[itemId] ?? margemGlobal`.

## 2. UI — campo global

- [x] 2.1 Adicionar um campo "Margem de lucro (%)" acima da tabela de pedidos, dentro do `Card`, com um texto pequeno explicando que é uma prévia (não afeta o pedido enviado) e que pode ser ajustada por item.
- [x] 2.2 Ligar o campo a `margemGlobal`/`setMargemGlobal`.

## 3. UI — por item, na linha expandida

- [x] 3.1 Na tabela de itens expandida de cada pedido, adicionar uma coluna "Preço de venda" (unitário) mostrando `moeda(precoDeVenda(item.precoUnitario, margemEfetiva(item.id)))` ou "—" quando `precoDeVenda` retorna `null`.
- [x] 3.2 Adicionar um campo pequeno de margem % por item (pré-preenchido com `margemEfetiva(item.id)`), que ao ser editado atualiza `margensPorItem[item.id]` (via `setMargensPorItem`), "travando" aquele item na margem customizada independente do valor global depois.
- [ ] 3.3 Conferir visualmente que a nova coluna não quebra o layout da tabela expandida existente (produto/preço embalagem/preço unitário/subtotal) em telas comuns de desktop (a tela é desktop-first no admin).

## 4. Garantir que nada é persistido/enviado

- [x] 4.1 Confirmar que `margemGlobal`/`margensPorItem` não são lidos em nenhuma chamada de API existente (`enviar.mutateAsync`, `baixarPedidoPdf`, o link/chamada de XLSX) — são estado local, puramente de exibição.
- [x] 4.2 Confirmar que os dois estados não usam `localStorage`/`sessionStorage` — devem resetar ao desmontar/remontar o componente (navegar para outra tela e voltar), conforme o requirement de ser efêmero.

## 5. Testes

- [x] 5.1 Teste: preencher a margem global e expandir um pedido mostra o preço de venda de cada item calculado corretamente (`precoUnitario * 1.30` para margem "30").
- [x] 5.2 Teste: editar a margem de um item específico faz esse item usar o valor próprio, sem afetar os demais itens do mesmo pedido.
- [x] 5.3 Teste: mudar a margem global depois de um item já ter margem própria não altera o preço de venda desse item, mas atualiza os demais.
- [x] 5.4 Teste: sem nenhuma margem preenchida, a coluna de preço de venda mostra "—" para todos os itens.
- [x] 5.5 Teste: `enviar.mutateAsync`/chamadas de exportação não recebem nem `margemGlobal` nem `margensPorItem` como argumento (mock/spy verificando o payload).
- [x] 5.6 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 6. Verificação visual

- [ ] 6.1 Testar manualmente (dev): abrir o Resultado de uma cotação apurada com 2+ empresas vencedoras, preencher a margem global, expandir os pedidos e conferir os preços de venda; customizar a margem de um item e confirmar que ele "trava" independente do campo global.
- [ ] 6.2 Confirmar que recarregar a página zera a margem (campo volta vazio, nenhum preço de venda exibido até preencher de novo).
