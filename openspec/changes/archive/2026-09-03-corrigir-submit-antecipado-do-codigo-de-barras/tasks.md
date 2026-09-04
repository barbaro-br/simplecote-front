## 1. Corrigir o campo

- [x] 1.1 Em `ProdutoForm.tsx`: adicionar `onKeyDown` no `<Input>` de código de barras (registrado via `form.register('codigoBarras', {...})`) — quando `e.key === 'Enter'`, chamar `e.preventDefault()` e acionar a mesma função usada pelo botão "Buscar" (`handleLookup`).
- [x] 1.2 Conferir que o botão "Buscar" continua funcionando por clique normalmente (sem regressão).
- [x] 1.3 Conferir que Enter em outros campos do formulário (nome, embalagem, quantidade) continua submetendo o formulário normalmente — a mudança é só no campo de código de barras.

## 2. Testes

- [x] 2.1 Teste: digitar um código de barras, pressionar Enter, e verificar que a busca (`handleLookup`/chamada à API de lookup) é acionada e o formulário não é submetido (sem erro de validação "Informe o nome do produto" aparecendo).
- [x] 2.2 Teste: clicar em "Buscar" continua funcionando como antes.
- [x] 2.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [x] 3.1 Testar manualmente (dev): abrir "Novo Produto", digitar um código de barras no campo e pressionar Enter — confirmar que não aparece erro de validação e que a busca é acionada (ou falha silenciosamente se o GTIN não existir).
