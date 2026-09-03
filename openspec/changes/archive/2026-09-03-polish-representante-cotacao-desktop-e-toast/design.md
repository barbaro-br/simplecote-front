## Context

```ts
toast('Preço removido', {
  position: 'top-center',
  action: { label: 'Desfazer', onClick: () => setPrecoTexto(valorAnterior) },
})
```
Sem `duration` nem `id`. O `<Toaster richColors position="bottom-right" />`
global em `App.tsx` também não define `duration` padrão diferente do
`sonner` (a chamada individual já sobrescreve `position` para
`top-center`, então o toast em si não herda a posição do `Toaster`, mas
herda a duração).

## Goals / Non-Goals

**Goals:**
- O toast desaparece num tempo prevísivel e curto, sem exigir interação do
  usuário pra sumir.
- Limpar o preço do mesmo item duas vezes seguidas não empilha dois toasts
  redundantes.

**Non-Goals:**
- Não muda o texto, a posição ou a ação do toast — só a duração e a
  deduplicação por item.

## Decisions

- **`duration: 4000`** explícito na chamada, e **`id: `preco-removido-${item.itemCotacaoId}`\`\*\*
  — o `sonner` substitui automaticamente um toast existente com o mesmo
  `id` em vez de empilhar, então limpar o mesmo item de novo reinicia o
  timer do mesmo toast em vez de abrir um segundo.

## Risks / Trade-offs

- [Risco] Se a causa raiz for outra (ex.: algum código chamando `toast()`
  mais de uma vez por clique), fixar `duration`/`id` mitiga o sintoma mas
  pode não eliminar uma causa mais profunda — por isso a tarefa 1 abaixo
  pede investigação antes do fix, não só aplicar `duration`/`id` às cegas.
