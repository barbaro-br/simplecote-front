## Why

O segmento "Cotações" do breadcrumb (change `adicionar-breadcrumb-navegacao`, já arquivada), em `CotacaoDetalhePage.tsx` e `ResultadoPage.tsx`, aponta pra `/admin` — que é o **Dashboard**, não a lista de Cotações (`/admin/cotacoes`). Achado ao testar ao vivo: clicar em "Cotações" no breadcrumb leva pro Dashboard. Esse valor (`/admin`) já vinha do link antigo que o breadcrumb substituiu (bug pré-existente, só carregado adiante sem ser notado).

## What Changes

- `CotacaoDetalhePage.tsx` e `ResultadoPage.tsx`: o item "Cotações" do breadcrumb passa a apontar pra `/admin/cotacoes` (a lista real), não `/admin` (o Dashboard).

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o requirement de navegação por breadcrumb é corrigido pra apontar pro destino certo.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — `to: '/admin'` → `to: '/admin/cotacoes'`.
- `src/admin/cotacoes/ResultadoPage.tsx` — mesma correção.
