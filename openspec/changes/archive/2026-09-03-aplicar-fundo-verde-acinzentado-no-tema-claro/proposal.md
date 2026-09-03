## Why

Levantado ao vivo: o fundo do painel (`--background`/`--card`, tema claro)
usa `oklch(0.98 0.004 90)` — lightness alta com chroma quase zero, ou seja,
branco praticamente puro, sem nenhuma temperatura. O usuário descreveu como
"branco seco" e pediu algo mais agradável.

Foi montada uma comparação visual com 4 opções (o branco atual + 3
candidatos), renderizadas no contexto real da tela de Cotação. O usuário
escolheu a **Opção C — verde-acinzentado**, que usa a mesma família de matiz
(hue ≈165) do `--primary` (verde-teal, hue 155) já existente no sistema —
lê como "combinou de propósito" em vez de um cinza genérico, seguindo a
prática de escolher neutros com viés sutil para o tom de destaque da marca,
em vez de neutros puramente acromáticos.

## What Changes

- `--background`, `--card`, `--border` e `--input` (tema claro) passam de
  neutro acromático para um verde-acinzentado sutil, na mesma família de
  matiz do `--primary`.
- A mudança é replicada nos dois pontos que hoje declaram os valores claros:
  o bloco `:root` (tema claro padrão) e o bloco `.tema-claro` (tema claro
  forçado na tela pública do representante, que já documenta manter os
  mesmos valores de `:root`).
- O tema escuro (`.dark`) NÃO muda.
- Os demais tokens neutros (`--muted`, `--secondary`, `--accent`,
  `--sidebar*`) permanecem como estão — não fizeram parte da comparação
  aprovada; ficam de fora deste change para não expandir o escopo além do
  que foi mostrado e escolhido.

## Capabilities

### Modified Capabilities

- `shared/design-system`: novo requirement sobre a paleta neutra do tema
  claro ter viés cromático sutil alinhado ao `--primary`, em vez de ser
  puramente acromática.

## Impact

- `src/index.css` (blocos `:root` e `.tema-claro`)
