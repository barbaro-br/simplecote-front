## 1. Modal aninhado em ItensSection

- [x] 1.1 `ItensSection.tsx`: no `<Dialog>` de "adicionar item", adicionar "Não achou? Cadastrar novo produto" que abre um **segundo** `<Dialog>` com `<ProdutoForm aoSalvar={...}>`. O 1º modal permanece montado (quantidade digitada preservada). Verificar: `npx tsc -b` 0; abrir o 2º modal não fecha o 1º.
- [x] 1.2 `aoSalvar` do `ProdutoForm` aninhado recebe o `Produto` criado → fecha o 2º modal, guarda `produtoRecemCriadoId`. No `onSuccess` de `useCriarProduto`, `queryClient.setQueryData(['produtos'], old => [...(old ?? []), novo])` + `invalidateQueries(['produtos'])`. O seletor de Produto do 1º modal passa a ter o novo como valor selecionado. Verificar: `npx tsc -b` 0.

## 2. Teste

- [x] 2.1 `admin/cotacoes` — cotação em `RASCUNHO`, abrir "adicionar item", clicar "Cadastrar novo produto", preencher o `ProdutoForm` no modal aninhado (MSW `POST */api/produtos` → 201), salvar → 2º modal fecha, o Produto novo aparece **pré-selecionado** no seletor; confirmar quantidade e adicionar (MSW `POST */api/cotacoes/:id/itens` → 201) → item na lista. Nenhuma navegação de rota ocorreu. Verificar: `npx vitest run src/admin/cotacoes` verde.

## 3. Fechamento

- [x] 3.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [x] 3.2 `openspec validate criar-produto-no-fluxo-da-cotacao` sem erros.
