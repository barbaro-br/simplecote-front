## Context

`aoAtualizarQuantidade(itemId, quantidade)` já existe e já dispara o
`PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade` (chamado hoje pelos
dois botões `[-]`/`[+]` com `quantidadeSolicitada ± 1`). Não é preciso
endpoint novo — só um caminho adicional de entrada que chama a mesma
função com um valor arbitrário.

## Decision

O `<span className="min-w-6 text-center text-xs font-medium
tabular-nums">{item.quantidadeSolicitada}</span>` (dentro do bloco
`quantidadeEditavel ? (...)`) vira um `<input type="number" inputMode="numeric"
min={1}>` controlado por estado local por linha (`useState<string>`
inicializado com `String(item.quantidadeSolicitada)`, sincronizado via
`useEffect`/`key` quando o valor externo muda por outra via — ex. outro
admin editando ao mesmo tempo, refletido pela atualização SSE da grade).

Confirmação em `onBlur` e em `onKeyDown` quando a tecla é `Enter`
(chamando `e.currentTarget.blur()` para reusar o mesmo caminho de
commit): parseia o valor (`parseInt`), valida `Number.isInteger(v) &&
v >= 1`; se válido e diferente do valor atual, chama
`aoAtualizarQuantidade(item.itemCotacaoId, v)`; se inválido, reverte o
estado local para `String(item.quantidadeSolicitada)` sem chamar a
função. `disabled={quantidadePendente}` no input, igual aos botões, para
não permitir edição concorrente enquanto uma atualização já está a
caminho.

Layout: input estreito (`w-10`/`w-12`, `text-center`, `tabular-nums`),
substituindo só o `<span>` — os dois botões continuam nas mesmas
posições ao redor dele.

## Alternatives Considered

- **Popover tipo calculadora/numpad** (segunda sugestão da auditoria):
  rejeitado por desproporção — um `<input type="number">` já resolve o
  problema (digitar o valor direto) com uma fração do código e sem
  componente novo.
- **Substituir os botões `[-]`/`[+]` pelo input** (não manter os dois
  caminhos): rejeitado — os botões continuam sendo o caminho mais rápido
  para ajustes de 1 em 1 (ex.: corrigir de 9 para 10), e a auditoria
  original também não pediu removê-los, só reclamou da falta de
  alternativa para ajustes grandes.
