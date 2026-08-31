## Context

A implementação "one-click" do modal foi ótima para velocidade de inserção, mas pecou no aspecto de definição de quantidade: por salvar imediatamente com quantidade=1, obriga o usuário a voltar na tabela depois para preencher as quantidades certas de cada item.

## Decisions

1. **Estado Local de Seleção**: O `AdicionarItemModal` deixará de fazer o `.mutate()` no momento do click da linha. Vamos introduzir um state local `draftItems: Map<string, number>` (produtoId -> quantidade) para os ITENS NOVOS marcados.
2. **Produtos já existentes**: Produtos que já estão na prop `itens` da cotação vão aparecer com o checkbox já marcado e desabilitado visualmente, para indicar que "este item já faz parte da cotação". (A edição de quantidade do que já existe continuará na tela principal).
3. **Fluxo Concluído**: Ao clicar no botão "Concluído", varremos o `draftItems` e executamos um `Promise.all` de `useAdicionarItem.mutateAsync({ produtoId, quantidade })`. Exibiremos loading no botão principal enquanto as promessas executam. Se não houver nada no draft, apenas fechamos o modal.
4. **Campo Numérico**: Ao lado/frente do nome do produto no modal, renderizar um `<Input type="number" />` pequeno ou os botões de `+` e `-` se o item estiver no estado `draftItems`.
