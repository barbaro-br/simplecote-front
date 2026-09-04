## Why

Achados verificados por leitura de código em `ItemLanceCard.tsx` (tela do
representante, mobile-first):

1. **Input de P.CX estreito**: o `<input>` de preço da embalagem tem
   `w-14` (56px) — para um preço de 4+ dígitos com centavos (ex.
   "1.234,56", comum em embalagens fechadas/caixas), o texto digitado
   fica maior que a área visível do input, exigindo rolagem horizontal
   dentro dele sem indicação visual, dificultando conferir o que foi
   digitado.
2. **Legendas "P.CX"/"P.UN" microscópicas**: `text-[9px]` (abaixo do
   menor tamanho legível recomendado para mobile), difícil de ler em
   ambiente de baixa luz (galpão/depósito, contexto real de uso do
   representante).

## What Changes

- Aumentar a largura do `<input>` de P.CX (de `w-14`/56px para uma
  largura que acomode confortavelmente valores até "9.999,99" sem
  rolagem interna) e ajustar em conjunto o `min-w` da caixa de P.UN, **mantendo
  a paridade visual de largura entre as duas caixas** já exigida pelo
  requirement "Visualização da Cotação por token" — não é uma
  requirement nova, é o mesmo contrato com números maiores.
- Aumentar as legendas "P.CX"/"P.UN" de `text-[9px]` para `text-[10px]`
  — um passo modesto e seguro para não quebrar o layout de uma linha
  em telas de 375px (mobile-first), mas perceptível na legibilidade.
- Aumentar a legenda de embalagem/quantidade (linha abaixo do nome do
  produto, hoje `text-[11px]`) para `text-xs` (12px), já que essa linha
  ocupa a largura toda do card e tem espaço de sobra para crescer sem
  quebrar layout.
- **Fora de escopo desta change** (para não arriscar quebra de layout em
  telas estreitas): os badges compactos numa única linha com o nome do
  produto (índice, "Novo", código de barras) permanecem no tamanho
  atual — são os elementos mais apertados horizontalmente e não foram o
  achado citado.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Visualização da Cotação por
  token" — aumenta a largura mínima confortável do campo P.CX/P.UN e o
  tamanho das legendas "P.CX"/"P.UN" e da linha de embalagem/quantidade.

## Impact

- `src/representante/cotacao/ItemLanceCard.tsx`
