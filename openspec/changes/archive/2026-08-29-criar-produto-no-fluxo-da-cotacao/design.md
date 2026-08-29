## Context

Ver `proposal.md`. Estado (após `dialogs-reutilizaveis` + `produto-codigo-de-barras-primeiro`):

- "Adicionar item" é um `<Dialog>` com um seletor de Produto + quantidade → `useAdicionarItem`.
- `ProdutoForm` é um componente que recebe `aoSalvar` e roda dentro de `<Dialog>`; já com "código de barras primeiro".
- `useCriarProduto` invalida `['produtos']`; `useProdutos` alimenta o seletor de item.
- `Dialog` é `createPortal(body)` — dois abertos ao mesmo tempo empilham no `body` (o segundo por cima).

## Goals / Non-Goals

**Goals:**
- Cadastrar Produto no meio do "adicionar item" e voltar com ele pré-selecionado.
- Zero navegação pra fora do detalhe da Cotação.

**Non-Goals:**
- Criar Empresa/Representante inline nesse fluxo (outra necessidade, outra hora).
- Edição inline de Produto existente a partir daqui (só criação).
- Multi-cadastro em lote.

## Decisions

### 1. Modal aninhado, não wizard
Dentro do `<Dialog>` de "adicionar item", um link/botão "Não achou? Cadastrar novo produto" abre um **segundo** `<Dialog>` com `<ProdutoForm>`. O primeiro continua montado por trás (estado preservado: quantidade já digitada, etc.). `Escape`/clique-fora do segundo fecha só ele.

- Alternativa (trocar o conteúdo do mesmo modal por um "passo 2"): perde o contexto visual e complica o "voltar". Dois `Dialog` empilhados é mais simples e o portal já suporta.

### 2. Pré-seleção via callback + refetch
`ItensSection` guarda `produtoRecemCriadoId`. O `aoSalvar` do `ProdutoForm` aninhado recebe o `Produto` criado (o `useCriarProduto` já resolve com o `Produto` da resposta) → fecha o 2º modal, seta `produtoRecemCriadoId`, e o `onSuccess` da mutation invalida `['produtos']`. Quando `useProdutos` retorna a lista atualizada, o seletor de Produto do 1º modal usa `produtoRecemCriadoId` como valor selecionado.

- Corner case: a lista pode revalidar antes do `setState` — usar `queryClient.setQueryData(['produtos'], old => [...old, novo])` no `onSuccess` pra o novo aparecer na hora, e o `invalidate` reconcilia depois.

### 3. Sem mudança em `ProdutoForm` nem nos hooks
`ProdutoForm` já é reutilizável e agnóstico de onde roda. `useCriarProduto` já existe. A change é só a orquestração em `ItensSection`.

## Risks / Trade-offs

- **Foco/trap entre 2 modais** — o `Dialog` de `dialogs-reutilizaveis` faz trap simples por container; com dois montados, o trap do 2º (por cima) é o que importa. Ao fechar o 2º, devolver foco pro gatilho dentro do 1º. Cobrir com teste.
- **z-index / overlay duplo** — dois overlays `bg-black/40` empilham e escurecem demais. Decidir: o 2º `Dialog` sem overlay próprio (o do 1º já cobre) ou um overlay mais claro. Detalhe de CSS, resolver no apply.
- **Depende de 2 changes** — se `dialogs-reutilizaveis` ou `produto-codigo-de-barras-primeiro` não tiverem sido aplicadas, esta fica bloqueada (o modal aninhado e o `ProdutoForm` no modal são pré-requisitos).
