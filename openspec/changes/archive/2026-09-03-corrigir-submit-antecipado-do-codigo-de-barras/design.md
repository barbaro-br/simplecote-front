## Context

`ProdutoForm.tsx` usa `react-hook-form`; o campo de código de barras é um
`<Input {...form.register('codigoBarras')}>` dentro de `<form
onSubmit={form.handleSubmit(aoEnviar)}>`. O botão "Buscar" é `type="button"`
(não submete), mas o Enter dentro de qualquer `<input>` de um `<form>` HTML
dispara o submit nativo por padrão — daí o bug.

## Decision

Interceptar o Enter só nesse campo específico via `onKeyDown`, chamando
`e.preventDefault()` e a mesma função de busca do botão. Não mexer no
comportamento de Enter dos demais campos do formulário (nome, embalagem,
quantidade) — só o campo de código de barras precisa desse tratamento,
porque é o único alimentado por leitor físico.

## Alternatives Considered

- **Tirar o campo de dentro do `<form>`**: rejeitado — quebraria a
  submissão normal do restante do formulário e complicaria o layout sem
  necessidade.
- **Debounce automático (buscar a cada N caracteres, sem precisar de
  Enter/clique)**: fora de escopo — muda o comportamento existente do
  botão "Buscar" e não foi pedido; o problema é só o Enter disparar o
  submit errado.
