## Why

Apesar do novo modal de lista ter resolvido a escalabilidade da busca, a inclusão "one-click" imediata (marcar checkbox e já salvar) impede que o usuário defina a quantidade no momento da seleção. Isso o obriga a fechar o modal e editar as quantidades na tabela principal, o que quebra o fluxo de trabalho (double work).

## What Changes

Vamos transformar o modal de seleção em um modo de "Rascunho / Carrinho" (Bulk Add):
- **Checkbox + Quantidade**: Ao marcar um produto, um campo numérico de quantidade a ser comprada aparecerá na mesma linha (padrão `1`), permitindo o ajuste imediato.
- **Botão Concluído**: O salvamento deixa de ser instantâneo a cada clique. Todas as seleções (e suas respectivas quantidades) ficam num estado local. Apenas ao clicar no botão "Concluído", os itens novos marcados são enviados para a cotação usando suas quantidades especificadas.
- **Edição Restrita**: Para produtos que já estavam na cotação antes de abrir o modal, podemos mostrá-los bloqueados/marcados como "Já adicionado", focando este modal apenas na rápida **adição em lote**. (A alteração de quantidade de um item existente continua sendo feita na tabela ou na apuração).

## Impact

- Redução massiva de requisições: em vez de bater na API a cada check/uncheck, faremos apenas `Promise.all` na saída do modal, tornando tudo mais rápido.
- O usuário passa a ter controle total das quantidades antes que o item polua a listagem real da cotação.
