## Why

Achado verificado ao vivo (auditoria independente, sessão 2026-09-03): no
formulário "Novo Produto"/"Editar Produto", o campo "Código de barras
(GTIN)" está dentro do `<form onSubmit={aoEnviar}>` sem tratamento de
tecla. Ao bipar um código de barras com leitor físico (que digita os
dígitos e finaliza com Enter), o Enter dispara o **submit do formulário**
em vez de acionar a busca do GTIN — reproduzido manualmente no navegador:
digitar um código e apertar Enter mostra o erro "Informe o nome do
produto" em vez de buscar. Isso quebra o fluxo de bipagem, que é o caso de
uso principal do campo.

## What Changes

- No `<Input>` de código de barras do `ProdutoForm`, interceptar a tecla
  Enter (`onKeyDown`): `e.preventDefault()` e acionar `handleLookup` (a
  mesma função do botão "Buscar"), em vez de deixar o Enter borbulhar
  para o submit nativo do `<form>`.
- Sem alteração de comportamento quando o campo está vazio ou quando o
  usuário aciona "Buscar" pelo clique — só o atalho de teclado muda.

## Capabilities

### Modified Capabilities

- `admin/produtos`: requirement "Consulta externa por Código de Barras
  (GTIN)" — adiciona o disparo da busca via Enter no campo, sem submeter
  o formulário.

## Impact

- `src/admin/produtos/ProdutoForm.tsx`
