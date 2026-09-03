## Why

Confirmado ao vivo: cada célula `COTADO` da grade ao vivo ocupa duas linhas
de texto — uma linha de rótulos ("COTADO" + badge "MENOR" quando aplicável)
e uma linha de valores (preço da embalagem + preço unitário) — deixando
cada linha da tabela mais alta do que precisa. O usuário pediu para deixar
a grade mais fina, e apontou que "COTADO"/"MENOR" são redundantes: a cor de
fundo/borda que já distingue o menor preço (verde) já existe hoje junto do
texto — o texto é informação duplicada.

## What Changes

- Célula `COTADO` passa a mostrar preço da embalagem e preço unitário numa
  única linha (ex.: "R$ 12,50 · R$ 0,50/un"), sem o rótulo "COTADO".
- O badge de texto "MENOR" é removido — o menor preço do item continua
  destacado só pela cor de fundo/borda (verde), que já existe hoje.
- Célula `PENDENTE`/`NAO_COTADO` passa a mostrar só a pílula de status,
  sem a linha extra de traço ("—") abaixo dela.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirements "Grade ao vivo da Cotação" e "Apresentação
  visual refinada da grade ao vivo" — células ficam de uma linha só, sem
  os rótulos de texto redundantes com a cor.

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx`
