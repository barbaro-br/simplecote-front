## 1. Criar novo Componente AdicionarItemModal

- [x] 1.1 Criar o arquivo `src/admin/cotacoes/AdicionarItemModal.tsx`.
- [x] 1.2 Implementar a casca do modal usando `<Dialog>` (Shadcn/Base UI), recebendo os estados `open` e `onClose`.
- [x] 1.3 Adicionar lógica de busca local (state `search`) e filtro na lista de produtos.

## 2. Lógica de Add/Remove Automático

- [x] 2.1 No modal, cruzar a lista de `produtos` ativos com os `itens` atuais da cotação. Exibir um checkbox que estará marcado se o produto já está na cotação.
- [x] 2.2 Ao marcar o checkbox (ou clicar na linha), disparar o `useAdicionarItem(cotacaoId)` com `{ produtoId: p.id, quantidade: 1 }`.
- [x] 2.3 Ao desmarcar o checkbox, encontrar o `itemId` correspondente na cotação e disparar `useRemoverItem(cotacaoId)` para aquele `itemId`. (Mostrar feedback de loading durante a operação).

## 3. Integração na Tela de Cotação

- [x] 3.1 Em `ItensSection.tsx`, substituir a renderização do antigo `<Dialog>` pelo novo `<AdicionarItemModal>`.
- [x] 3.2 Remover os `useState` antigos e dependências exclusivas do modal antigo (ex: `produtoId`, `quantidade`, `aoAdicionar`) do `ItensSection`.
- [x] 3.3 Garantir que o link rápido "Cadastrar novo produto" abra corretamente a tela/aba de cadastro.
