## Context

The front-end is using React 19, Vite, Tailwind v4, and `@base-ui/react`. We want to introduce broad UX improvements across both the mobile-first Representante area and the Admin dashboard (see `proposal.md` - Why). We already have `tw-animate-css` installed.

## Goals / Non-Goals

**Goals:**
- Centralize animation and transition tokens so they can be reused easily.
- Use standard HTML/CSS and lightweight React logic where possible, avoiding heavy animation libraries if not needed.
- Provide a smooth mobile experience in the Representante app.

**Non-Goals:**
- Completely rewriting existing React components.
- Adding heavy dependencies like Framer Motion unless absolutely required.

## Decisions

### 1. View Transitions
**Decision**: Leverage React Router's built-in support for the View Transitions API (e.g. `startViewTransition`) or simple CSS transitions for route changes, instead of a heavy animation library.
**Rationale**: Keeps the bundle small and uses native browser capabilities.
**Alternatives**: Framer Motion (rejected due to bundle size).

### 2. Pull-to-refresh implementation
**Decision**: Create a custom `usePullToRefresh` hook that listens to `touchstart`, `touchmove`, and `touchend` events to trigger React Query's `refetch()` method.
**Rationale**: Lightweight and perfectly integrated with our current data-fetching strategy (`@tanstack/react-query`).
**Alternatives**: Using a third-party library like `react-simple-pull-to-refresh`, but it might be overkill.

### 3. Bottom Sheets (Drawers)
**Decision**: Implement the Bottom Sheet using the existing `@base-ui/react` Dialog primitives but styled to anchor at the bottom of the screen with a slide-up animation from `tw-animate-css`.
**Rationale**: Avoids adding new dependencies.
**Alternatives**: Installing `vaul` (widely used for bottom sheets in the React ecosystem). We can evaluate `vaul` if the base-ui implementation is too complex for touch gestures.

### 4. Number Rolling Animations
**Decision**: Create a lightweight `<AnimatedNumber value={N} />` component that uses `requestAnimationFrame` to interpolate from 0 to the target value over 1-2 seconds.
**Rationale**: We only need simple counting up, not complex physics-based spring animations.

### 5. Staggered List Animations
**Decision**: Use simple CSS variables and inline styles `style={{ animationDelay: \`\${index * 50}ms\` }}` combined with a generic `fade-in-up` animation class.

## Risks / Trade-offs

- **Risk**: Native View Transitions are not fully supported in older iOS Safari versions.
  - **Mitigation**: View Transitions fallback gracefully (it just swaps immediately like it does today).
- **Risk**: Custom Pull-to-refresh might conflict with native browser scrolling.
  - **Mitigation**: Ensure `touch-action` is handled correctly (e.g., `touch-action: pan-y`) and only trigger the refresh when `scrollTop === 0`.
