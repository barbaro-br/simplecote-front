## Context

`AbrirCotacaoDialog.tsx` tem duas `<div>` de visualização (`animate-in
slide-in-from-left-4` para presets, `animate-in slide-in-from-right-4
min-h-[420px]` para a Data Personalizada) alternadas por um `view` state
(`'presets' | 'personalizado'`), ambas dentro do mesmo `<Dialog
className="... max-w-[420px]">`. Como o `Dialog` não tem altura fixa, ele se
ajusta ao conteúdo de cada visualização — daí o salto.

## Decision

Adicionar `min-h-[420px]` (mesmo valor já usado na visualização de
calendário) na `<div>` de presets também, garantindo que as duas
visualizações ocupem a mesma altura mínima e o `Dialog` não precise
redimensionar ao trocar entre elas. Se sobrar espaço vazio na visualização
de presets com essa altura mínima, usar `justify-center`/`flex flex-col
justify-center` no container para distribuir o espaço de forma equilibrada
em vez de deixar um vão preso ao final.

## Alternatives Considered

- **Altura fixa (não só mínima) no `Dialog` inteiro**: rejeitado — trava o
  modal num tamanho maior que o necessário mesmo antes de haver conteúdo
  para preencher, o que pode parecer um espaço vazio grande demais em telas
  onde os presets já bastam.
