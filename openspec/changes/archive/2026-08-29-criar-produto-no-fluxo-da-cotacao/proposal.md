## Why

Montando uma Cotação, se o Produto que o Comprador quer adicionar ainda não está no catálogo, hoje ele precisa **abandonar a tela**: sair do detalhe da Cotação, ir em Produtos, cadastrar, voltar, reabrir o "adicionar item". Quebra o fluxo justamente no momento de maior pressa (montar a lista de compra).

## What Changes

- No modal "Adicionar item" (de `dialogs-reutilizaveis`), quando o Produto buscado não existe: um atalho **"Cadastrar novo produto"** abre o modal de `ProdutoForm` **aninhado** (reusa o de `dialogs-reutilizaveis` + o fluxo código-de-barras-primeiro de `produto-codigo-de-barras-primeiro`).
- Ao salvar o novo Produto: o modal de cadastro fecha, o catálogo revalida, e o novo Produto fica **pré-selecionado** no seletor de "adicionar item" — o Comprador só confirma a quantidade e adiciona.
- Sem sair do detalhe da Cotação em momento nenhum.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `admin/cotacoes`: o requisito **"Montar itens da Cotação"** ganha o cenário de cadastrar um Produto novo sem sair da tela e já usá-lo no item.

## Impact

- `src/admin/cotacoes/ItensSection.tsx` (atalho + modal aninhado + pré-seleção), reuso de `ProdutoForm` e do `Dialog`.
- Leitura de `src/admin/produtos/produtos.api.ts` (`useCriarProduto`, invalidação do catálogo).
- Teste em `admin/cotacoes`: "produto inexistente → cadastra no modal aninhado → aparece pré-selecionado → adiciona à cotação".
- **Depende de** `dialogs-reutilizaveis` (modal aninhável) e `produto-codigo-de-barras-primeiro` (o `ProdutoForm` reusado já com GTIN primeiro).
