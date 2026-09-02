## Why

Auditoria visual em viewport estreito (768px/tablet e ~390px/celular) achou uma quebra real, não só falta de polimento: no Dashboard, em 768px, o card "Gastos" fica tão espremido que "Mês anterior" e seu valor ficam **cortados/sobrepostos**, ilegíveis. Causa raiz dupla:
1. `AdminLayout.tsx` não tem nenhum tratamento de breakpoint — a sidebar expandida (`w-64` ≈ 256px) continua consumindo esse espaço fixo independentemente da largura da tela.
2. `PainelDashboard.tsx` usa grid baseado em **viewport** (`md:grid-cols-3`, breakpoint em 768px de tela inteira) para decidir quantas colunas mostrar — mas o espaço realmente disponível pro conteúdo é `viewport - largura da sidebar`, não o viewport inteiro. Em exatos 768px de tela, o breakpoint liga 3 colunas quando só há ~512px reais disponíveis (768 − 256 da sidebar), e os cards não cabem.

## What Changes

- A sidebar passa a colapsar automaticamente (modo ícone) abaixo de um breakpoint (768px), liberando espaço horizontal para o conteúdo. O toggle manual de expandir/recolher (e o hover-to-expand) só ficam disponíveis acima desse breakpoint — abaixo dele, forçar a sidebar expandida é exatamente o que causa o corte hoje.
- Os grids de `PainelDashboard.tsx` que hoje decidem colunas por `md:`/viewport passam a usar **container queries** (nativo do Tailwind v4, já em uso no projeto — sem dependência nova) — a contagem de colunas passa a responder à largura real da área de conteúdo, não à largura da tela inteira. Isso elimina a causa raiz (breakpoint de viewport não sabe da sidebar), não só empurra o problema pra outro pixel.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/layout`: novo requirement — o painel permanece utilizável (sem texto cortado/sobreposto) em larguras comuns de tablet/celular.

## Impact

- `src/admin/layout/AdminLayout.tsx` — colapso automático por breakpoint.
- `src/admin/analise/PainelDashboard.tsx` — grids convertidos para container queries.
- Achado durante a auditoria visual, não fazia parte do pedido original de melhorias — é bug de quebra real (texto ilegível), não preferência estética.
- Recomendo aplicar **depois** de `fixar-sidebar-e-scroll-admin` (mesmo arquivo, `AdminLayout.tsx` — evita conflito de edição).
