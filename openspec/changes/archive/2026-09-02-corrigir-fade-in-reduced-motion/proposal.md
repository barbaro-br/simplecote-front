## Why

A lista de cotações (`CotacoesPage`) renderiza cada linha com `fade-in opacity-0` + `animationDelay` para um fade escalonado. A change `design-system-polish` adicionou suporte a `prefers-reduced-motion: reduce`, que desliga a animação (`.fade-in { animation: none }`) — mas **não** reseta o `opacity-0`. Resultado: para usuários com "reduzir movimento" ativado, as linhas ficam permanentemente invisíveis (opacity 0), restando só o cabeçalho. É uma regressão real de produção que viola a própria requirement "Respeito à preferência de reduzir movimento … sem impedir o uso".

## What Changes

- Tornar a utilidade `.fade-in` auto-suficiente trocando o `animation-fill-mode` de `forwards` para `both` — assim o elemento fica escondido durante o `animationDelay` (fill `backwards` aplica `from { opacity: 0 }`) e visível ao final, **sem depender** de `opacity-0` externo.
- Remover o `opacity-0` (e o branch `isTest`) da linha em `CotacoesPage.tsx`, deixando só `fade-in` + `animationDelay`.

## Capabilities

### New Capabilities

### Modified Capabilities

Nenhuma. Correção de bug — o comportamento passa a cumprir a requirement já existente (`shared/design-system` — reduzir movimento) em vez de mudá-la. (`skip_specs: true`)

## Impact

- `src/index.css` — `.fade-in` de `forwards` para `both`.
- `src/admin/cotacoes/CotacoesPage.tsx` — remover `opacity-0` e o condicional `isTest` (código de teste embutido em produção).
- `src/admin/cotacoes/CotacoesPage.test.tsx` — guarda de regressão: linha renderizada sem `opacity-0`.
