## 1. Tokens de base e motion (src/index.css)

- [x] 1.1 Adicionar tokens semânticos `info`/`info-foreground`, `success-foreground` e `warning-foreground`, e trocar a paleta `chart-1..5` de cinza para cores cromáticas, nos blocos `:root`, `.dark` e `.tema-claro`. Verificar: `npm run build` verde (o `@theme inline` já mapeia os tokens para o Tailwind).
- [x] 1.2 Adicionar tokens de elevação (`--shadow-xs/sm/md/lg`) e de motion (`--duration-*`/`--ease-*`) nos três blocos. Verificar: `npm run build` verde.
- [x] 1.3 Adicionar bloco `@media (prefers-reduced-motion: reduce)` que neutraliza `flash-green`, `pop`, `success-pop`, `fade-in`, `shimmer` e as transições de botão/sidebar. Verificar: `npm run lint` verde e conferir que as animações ficam neutras com a preferência ativa.

## 2. Eliminar cores cruas (paleta fixa → token)

- [x] 2.1 Em `admin/analise/PainelDashboard.tsx`, trocar `text-green-600` (2x) por `text-success`. Verificar: `npm test` do `PainelDashboard.test.tsx` verde e `npm run lint` verde.
- [x] 2.2 Em `representante/cotacao/ConfirmarEnvioDialog.tsx`, trocar `border-amber-200 bg-amber-50 text-amber-700` por `border-warning/30 bg-warning/10 text-warning`. Verificar: teste do componente verde e `npm run lint` verde.
- [x] 2.3 Em `admin/cotacoes/RepresentantesModal.tsx`, substituir a paleta fixa de avatares (`blue/indigo/purple/pink/orange/amber/emerald`) por tokens `--avatar-*` (D3) e trocar `green-50/700 + border-green-200`, `text-green-600` e `text-emerald-600` por `success`. Verificar: testes do componente verde e `npm run lint` verde.

## 3. Componentização

- [x] 3.1 Em `admin/cotacoes/CotacoesPage.tsx`, trocar o `<input>` cru da busca pelo componente `<Input>` do design system. Verificar: `npm test` do `CotacoesPage.test.tsx` verde e `npm run lint` verde.
- [x] 3.2 Adicionar `asChild` ao `<Button>` (via `Merge` do `@base-ui/react`) e usá-lo no link "Nova cotação" de `CotacoesPage.tsx` no lugar do `<Link>` com classes reimplementadas. Verificar: `npm test` verde e `npm run build` verde.
- [x] 3.3 Em `admin/login/LoginPage.tsx`, trocar o título "Sarah Supermercado Cotacoes" por "SimpleCote". Verificar: `npm test` do `login.test.tsx` verde (ajustar só se o teste afirmava o nome antigo como identidade).

## 4. Tipografia, números e elevação

- [x] 4.1 Padronizar tamanhos de fonte arbitrários para a escala do Tailwind. Escopo reduzido por decisão do usuário: somente o subconjunto "no-op" (14px→`text-sm`, 16px→`text-base`, 18px→`text-lg`), preservando a densidade mobile intencional (9/10/11/13px ficam como estão). Verificar: `npm run build` verde.
- [x] 4.2 Garantir `tabular-nums` em todos os campos de preço/número (colunas de preço, prazos, valores monetários). Verificar: `npm run lint` verde e inspeção de alinhamento de coluna.
- [x] 4.3 Substituir a sombra ad-hoc do rodapé fixo do representante (`shadow-[0_-4px_24px_rgba(0,0,0,0.12)]`) pelo token de elevação definido em 1.2. Verificar: `npm run build` verde.

## 5. Verificação final

- [x] 5.1 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar que os três ficam verdes (regra AGENTS.md §3).
