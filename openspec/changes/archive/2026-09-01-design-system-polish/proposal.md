## Why

O SimpleCote já tem uma base visual sólida (tokens oklch, temas claro/escuro, Geist Variable e microanimações), mas o design system sofreu *drift*: cores cruas do Tailwind vazam no lugar dos tokens semânticos (quebrando o dark mode), a paleta semântica está incompleta (gráficos monocromáticos, sem `info`/`attention`) e não há escala de tipografia/elevação/motion. Há também inconsistência de componentes (inputs e botões reimplementados "na mão") e um vazamento de branding no login. É a hora de consolidar isso para elevar o visual a um padrão de produto "primeiro mundo", antes que mais telas repliquem os desvios.

## What Changes

- **Consolidar tokens semânticos** em `src/index.css`: adicionar `info`/`attention`, colorir a escala `chart-1..5` (hoje toda cinza), definir escala de elevação (shadow tokens) e tokens de duração/easing de motion.
- **Eliminar cores cruas**: substituir todas as classes do Tailwind com paleta fixa (`green-*`, `amber-*`, `blue-*`, `indigo-*`, `purple-*`, `pink-*`, `orange-*`, `emerald-*`) por tokens semânticos (`success`, `warning`, `destructive`, `primary`, etc.), garantindo legibilidade nos dois temas.
- **Tipografia consistente**: adotar escala tipográfica em vez de tamanhos arbitrários (`text-[10px]` … `text-[18px]`) e aplicar `tabular-nums` em todo campo numérico/preço.
- **Motion acessível**: aplicar `prefers-reduced-motion` globalmente, respeitando usuários que optam por reduzir animações.
- **Componentizar o que está cru**: usar `<Input>` na busca de cotações e o padrão `asChild` do `<Button>` no link "Nova cotação" (hoje reimplementados à mão).
- **Corrigir branding**: trocar o nome hardcoded "Sarah Supermercado Cotacoes" por "SimpleCote" na tela de login.

## Capabilities

### New Capabilities

- `shared/design-system`: contrato da linguagem visual (tokens de cor semântica, tipografia, elevação e motion) e a regra de que toda interface usa tokens — nunca cores cruas — para permanecer legível em claro e escuro.

### Modified Capabilities

<!-- Nenhuma capability existente muda de requisito: o polimento altera a camada visual compartilhada, não o comportamento de cotações/representante. -->

## Impact

- **Tokens/base**: `src/index.css` (novos tokens e regras de motion/reduced-motion).
- **Componentes**: `src/shared/components/ui/*` (`button`, `input`, `card` e adjacentes) para alinhar à escala de elevação/tipografia.
- **Telas admin**: `admin/layout/AdminLayout.tsx`, `admin/login/LoginPage.tsx`, `admin/cotacoes/CotacoesPage.tsx` e `RepresentantesModal.tsx`, `admin/analise/PainelDashboard.tsx` (cores cruas e branding).
- **Telas representante**: `representante/cotacao/ConfirmarEnvioDialog.tsx` (cores cruas).
- **Sem mudança** de contrato de API, regra de negócio ou dependências novas.
- **Impacto transversal (20+ arquivos)**: a execução será faseada, com a suíte de testes/build verde entre fases (regra AGENTS.md §5).
