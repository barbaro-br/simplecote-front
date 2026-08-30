## Context

O cliente reclamou que o modal nativo de "Adicionar item" com um `<select>` torna-se inviável para bancos de dados com muitos produtos (ex: 2.000+). A proposta é criar um modal mais rico (com barra de busca e checkboxes), muito semelhante ao recém-criado `RepresentantesModal`. A quantidade, que hoje é obrigatória preencher na hora, passará a ser 1 por padrão no ato da seleção (o usuário poderá alterar na tabela depois).

## Goals / Non-Goals

**Goals:**
- Substituir o diálogo nativo/simples de adição de itens por um novo `AdicionarItemModal` no estilo lista.
- Implementar "one-click add/remove": Clicar no checkbox de um item o adiciona/remove imediatamente da cotação (usando `useAdicionarItem` e `useRemoverItem` hooks).
- Quantidade será inferida como 1 no momento da marcação.
- O link para cadastrar produto rápido continuará existindo, redirecionando para a prop `aoCadastrarProduto`.

**Non-Goals:**
- Não vamos mudar a estrutura da tabela de Itens em si nesta change, apenas o fluxo de adição.

## Decisions

1. **UX de Checkbox Automático**: O checkbox no modal vai refletir se o item já existe na lista da cotação. Quando o usuário clica para marcar, nós acionamos a API de adicionar item (com quantidade 1). Quando desmarca, acionamos a API de remover o item da cotação. Isso requer que a gente saiba qual é o `itemId` correspondente àquele produto dentro da cotação atual.
2. **Componentes Tailwind**: Seguiremos o mesmo estilo do `RepresentantesModal` (`Dialog`, cabeçalho de busca, listagem zebrada ou com destaque).
3. **Cálculo de Selecionados**: Mapearemos os itens já salvos na cotação para exibir o checkbox marcado.
