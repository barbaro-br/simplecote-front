## Context

Ver `proposal.md`. Estado atual:

- `AdminLayout.tsx`: `<aside class="w-64">` fixo com `<Link>`s pequenos; sem ícone, sem colapso, "Cotações" é `<div>` (link real veio numa change anterior). `<main>` com `<Outlet/>`.
- `src/index.css`: `@theme` + `:root` já tem a estrutura de tokens shadcn e um `--primary` verde; falta alinhar o resto da paleta da `spec.md` §13.
- `lucide-react` já é dependência. Não há primitivo de badge.
- `spec.md` §13: painel default pro tema do sistema; tokens em `src/index.css`; §14: responsivo a partir de 1024px pro admin.

## Goals / Non-Goals

**Goals:**
- Sidebar que parece um app: ícone + rótulo, ativo destacado, hover suave, colapsável e persistente.
- Paleta §13 aplicada de fato.
- Um `StatusBadge` que padroniza a cor de status em todo lugar.

**Non-Goals:**
- Redesenhar as telas de feature (isso é das outras changes — modais, grade ao vivo).
- Mobile do admin (§14: abaixo de 1024px pode rolar; sidebar colapsada já ajuda).
- Trocar a lib de ícones ou adicionar animação com biblioteca.

## Decisions

### 1. Colapso: estado local + `localStorage`, não context
`AdminLayout` guarda `colapsada` (`useState` inicializado de `localStorage['simplecote:sidebar']`, `try/catch`), toggle no botão sanduíche, `useEffect` persiste. Sidebar `w-64` ↔ `w-16`; no modo colapsado só o ícone, rótulo vira `title`/tooltip nativo. Transição `transition-[width]`.

- Alternativa (context global): desnecessário — só o `AdminLayout` lê esse estado.

### 2. Item de nav = componente com `NavLink`
`react-router-dom` `NavLink` dá `isActive` de graça → destaque do ativo sem lógica manual. Cada item: ícone lucide (`Package` produtos, `Building2` empresas, `FileText` cotações, `LayoutDashboard` dashboard), rótulo, `aria-current` no ativo.

### 3. Tokens §13 em `:root` e no bloco dark
Editar `src/index.css`: `--primary: oklch(0.42 0.09 155)`, `--primary-foreground` claro; `--background`/`--card: oklch(0.98 0.004 90)` (claro) e `oklch(0.16 0.006 90)` (dark); adicionar `--success` (verde claro), `--warning` (âmbar). `--muted-foreground` pra "não cotado". Nada de cor solta em componente — tudo via var.

### 4. `StatusBadge` mapeia status → (label, classe de cor)
`<StatusBadge status={cotacao.status} />` → `<span>` com `bg-*/10 text-*` por estado: `RASCUNHO` neutro, `ABERTA` `--primary`, `ENCERRADA` `--warning`, `PEDIDOS_GERADOS` `--success`, `CANCELADA` `--destructive`. Um `Record<StatusCotacao, {label, cls}>` exaustivo (o compilador cobre novos estados).

## Risks / Trade-offs

- **`localStorage` indisponível** (aba anônima) → `try/catch`, default "expandida". Sem banner.
- **Contraste da paleta nova** — conferir AA nos pares texto/fundo (`spec.md` §14). Ajustar o `oklch` se algum par falhar.
- **Regressão visual nas telas existentes** — a paleta muda tons globalmente; passar o olho em Login, Produtos, Empresas, Cotações depois. Os testes existentes (RTL) não pegam cor, então é revisão manual.
