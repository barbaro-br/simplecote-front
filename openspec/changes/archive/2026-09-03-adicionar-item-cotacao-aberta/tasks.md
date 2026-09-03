## 1. Botão "Adicionar item" na grade ao vivo

- [x] 1.1 Em `CotacaoDetalhePage.tsx` (dentro de `GradeAoVivoContainer` ou logo acima da grade): adicionar estado `adicionarItemAberto` e um botão "Adicionar item", visível quando `status === 'ABERTA'`.
- [x] 1.2 Renderizar `<AdicionarItemModal cotacaoId={id} itens={cotacao.itens} open={adicionarItemAberto} onClose={...} aoCadastrarProduto={...} />` (componente já existente, sem modificar) — mesmo padrão de uso já feito em `ItensSection.tsx`.
- [x] 1.3 Confirmar que, ao adicionar o item com sucesso, a grade ao vivo (`useGradeAoVivo`) é invalidada/recarregada e o item novo aparece sem precisar de F5 (a mutation de adicionar item já deve invalidar a query certa — conferir `cotacoes.api.ts`).

## 2. Indicador "Novo" no representante

- [x] 2.1 Em `src/representante/cotacao/cotacao-token.derivados.ts`: nova função pura `itemEhNovo(item: ItemLance, todosItens: ItemLance[]): boolean` — retorna `true` quando `item.statusLance === 'PENDENTE'` e `todosItens.some(i => i.itemCotacaoId !== item.itemCotacaoId && i.statusLance !== 'PENDENTE')`.
- [x] 2.2 Em `CotacaoPorTokenPage.tsx`: para cada item renderizado, calcular `itemEhNovo(item, d.itens)` e passar como nova prop `novo` pro `ItemLanceCard`.
- [x] 2.3 Em `ItemLanceCard.tsx`: quando `novo` for `true`, exibir um badge pequeno "Novo" perto do nome do produto (mesma linguagem visual dos outros indicadores de status já existentes no card).

## 3. Testes

- [x] 3.1 Teste de `itemEhNovo`: casos verdadeiro (pendente entre respondidos) e falso (tudo pendente / tudo respondido / é o único pendente sozinho sem nenhum outro respondido — cobrir a condição exata).
- [x] 3.2 Teste: botão "Adicionar item" aparece só quando `status === 'ABERTA'` em `CotacaoDetalhePage`.
- [x] 3.3 Teste: `ItemLanceCard` renderiza o badge "Novo" quando `novo` é `true`, e não renderiza quando `false`.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Testar o fluxo completo com dados reais (dev): abrir uma Cotação `ABERTA`, um representante já responde alguns itens, o Comprador adiciona um item novo, o representante recarrega o link e vê o badge "Novo" nesse item.
