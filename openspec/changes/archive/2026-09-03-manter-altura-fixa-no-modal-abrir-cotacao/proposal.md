## Why

Verificado ao vivo: o modal "Abrir Cotação" tem duas visualizações internas —
a lista de presets (~365px de altura) e a Data Personalizada com calendário
(que já tem `min-h-[420px]`). Ao alternar de uma pra outra, o modal muda de
altura de repente, causando um salto visual perceptível.

## What Changes

- Aplicar a mesma altura mínima (`min-h-[420px]`, ou o valor que a
  visualização de calendário já usa) também na visualização de presets, para
  as duas telas do modal terem a mesma altura mínima e a transição entre elas
  não pular.

## Capabilities

### Modified Capabilities

- `cotacoes/abrir-cotacao-modal`: requirement "Definição de Prazo da
  Cotação" — adiciona a garantia de altura mínima consistente entre as duas
  visualizações do modal.

## Impact

- `src/admin/cotacoes/AbrirCotacaoDialog.tsx`
