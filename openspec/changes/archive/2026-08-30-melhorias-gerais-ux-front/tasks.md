## 1. Global Transistions & UI Components

- [x] 1.1 Add View Transitions API wrapper (e.g., using `react-router-dom` `<ViewTransition>` or standard CSS classes) to main routes and verify smooth navigation between Admin and Representante pages.
- [x] 1.2 Update base components (`button.tsx`, `card.tsx`, `input.tsx`) with active and hover CSS animations (using Tailwind) and verify they provide immediate visual feedback.
- [x] 1.3 Refactor the loading `skeleton.tsx` component to use a pulse/shimmer animation class and verify it displays correctly during mocked API delays.

## 2. Representante App (Mobile UX)

- [x] 2.1 Implement `usePullToRefresh` hook logic to capture touch gestures and trigger `refetch()`, and verify it works when pulling down on the `cotacao` list view.
- [x] 2.2 Create or style a Bottom Sheet component (using `@base-ui/react` Dialog primitives + CSS animations) and verify it slides up from the bottom correctly.
- [x] 2.3 Integrate the Bottom Sheet to replace the centralized action/filter menus in `/representante/cotacao` and verify the interactions.

## 3. Admin Dashboard Animations

- [x] 3.1 Create an `<AnimatedNumber>` component using `requestAnimationFrame` to animate counting from 0 to N and verify it interpolates numbers correctly.
- [x] 3.2 Update `painel-insights` dashboard components to use `<AnimatedNumber>` for statistics and verify they animate on initial load.
- [x] 3.3 Add staggered animation logic (CSS `animation-delay` + `@keyframes` fade-in) to the `admin/cotacoes` list and verify items appear sequentially.
