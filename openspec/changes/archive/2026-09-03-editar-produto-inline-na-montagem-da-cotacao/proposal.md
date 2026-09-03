## Why

Investigação do backlog corrigiu a premissa original: criar e editar Produto **já têm paridade** — `ProdutosPage.tsx` usa um único modal/`ProdutoForm`, chaveado por `produtoParaEditar` (indefinido = criar, preenchido = editar). O gap real e mais estreito é outro: dentro do fluxo de montar/adicionar itens numa Cotação (`AdicionarItemModal.tsx`), já existe "cadastrar produto novo sem sair da tela" — mas não existe "editar um produto já existente" a partir dali. Pra corrigir um nome ou a embalagem de um produto enquanto está montando uma Cotação, o Comprador precisa sair pra `ProdutosPage`, editar lá, e voltar.

## What Changes

- `AdicionarItemModal.tsx`: cada linha da lista de produtos ganha um ícone de editar, que abre o mesmo `ProdutoForm` (já usado hoje pra "cadastrar novo produto sem sair da tela") em modo edição (`produtoParaEditar`) pra aquele produto específico.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o requirement de montagem de itens ganha a opção de editar um produto existente sem sair da tela, ao lado da já existente opção de cadastrar um novo.

## Impact

- `src/admin/cotacoes/AdicionarItemModal.tsx` — ícone/ação de editar por linha.
- `src/admin/cotacoes/ItensSection.tsx` — estado de qual produto está em edição, reaproveitando o mesmo `Dialog`/`ProdutoForm` já usado pro cadastro.
- Nenhuma mudança de backend (`ProdutoForm`/`useAtualizarProduto` já existem e já funcionam).
