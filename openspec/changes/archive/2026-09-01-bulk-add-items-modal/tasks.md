## 1. Atualizar Estado do Modal (Rascunho / Draft)

- [x] 1.1 Em `AdicionarItemModal.tsx`, remover a lógica imediata do `useAdicionarItem` e `useRemoverItem` do evento de clique.
- [x] 1.2 Criar um state `drafts: Record<string, number>` que mapeará IDs de produtos para suas respectivas quantidades digitadas na tela.

## 2. Interface da Lista (Input de Quantidade)

- [x] 2.1 Durante o map de `filtrados`, se o produto já existir na cotação (`itensMap.has(p.id)`), exibi-lo como checked e `disabled` (com texto "Já adicionado").
- [x] 2.2 Se o produto estiver no state `drafts` (ou seja, acabou de ser checado pelo usuário no modal), renderizar na extremidade direita da linha um input numérico pequeno (ou componente Stepper) que controle a quantidade do draft daquele produto.
- [x] 2.3 Ao clicar na linha de um item que ainda não está no draft, inseri-lo no `drafts` com quantidade `1`. Se clicar para desmarcar, remover do objeto `drafts`.

## 3. Salvamento em Lote no Botão Concluído

- [x] 3.1 Converter o botão "Concluído" no Footer para aceitar o estado de carregamento (`isSubmitting`).
- [x] 3.2 Na função do botão "Concluído", iterar sobre as `keys` do objeto `drafts` e usar `Promise.all` para disparar `adicionar.mutateAsync({ produtoId, quantidade })` para cada um deles. (Isso exigirá mudar `adicionar` para exportar a async function ou pegar o mutateAsync do hook).
- [x] 3.3 Após o `Promise.all`, limpar os `drafts` e chamar `onClose()`.
## 4. Prevenção de Perda de Dados (UX)

- [x] 4.1 Interceptar a ação de fechar o modal (seja por botão X ou clique fora). Se `drafts` não estiver vazio, pedir confirmação (`window.confirm`) alertando que os itens selecionados não foram salvos.

## 5. Edição de Quantidade na Grade Principal

- [x] 5.1 No arquivo `cotacoes.api.ts`, criar o hook `useAtualizarQuantidadeItem` (usando `api.patch('/api/cotacoes/{cotacaoId}/itens/{itemId}/quantidade')`).
- [x] 5.2 Em `ItensSection.tsx`, substituir o `useEdit` mockado pelo novo `useAtualizarQuantidadeItem`. Ao disparar o `onChange`/`onBlur` do input de quantidade de um item já listado, chamar a mutation para persistir no backend real!
