## Why

The current frontend architecture and implementation (React 19, Vite, Tailwind v4, `@base-ui/react`) is robust, but the user experience lacks the fluid, premium feel expected in modern applications. The Admin dashboard is functional but static, and the Representante mobile area needs to behave more like a native app. This change groups and implements mass UI/UX improvements across the board to increase user satisfaction and ease of use.

## What Changes

- Implement a global system for route transitions (e.g., View Transitions API) to make navigation fluid.
- Add juicy hover and active micro-interactions to base UI components (`button.tsx`, `card.tsx`, `input.tsx`).
- Upgrade loading states (`skeleton.tsx`) to use dynamic pulses or shimmer effects.
- Introduce native-like mobile interactions to the Representante app: Pull-to-refresh, Swipe actions on lists, and Bottom Sheets for action menus instead of modal dialogs.
- Add engaging animations to the Admin Dashboard (e.g., rolling numbers in `painel-insights` and smooth expand/collapse on tables).

## Capabilities

### New Capabilities
- `core/ux-guidelines`: Defines the global transition system and standard micro-interactions (staggered lists, skeletons, button active states).

### Modified Capabilities
- `representante/cotacao`: Adds requirements for pull-to-refresh on lists, swipe actions on items, and bottom sheet menus.
- `admin/painel-insights`: Adds requirements for animated statistics and smooth expanding elements.
- `admin/cotacoes`: Modifies requirement to use staggered list animations for data loading.

## Impact

- `src/index.css` and `tailwind` configuration for new animation keyframes.
- `src/shared/components/ui/` for component updates.
- Wrapper layouts in `src/admin/layout` and `src/representante` to handle route transitions.
- Potential introduction of libraries for bottom sheets (e.g., `vaul` or custom build using base-ui) and pull-to-refresh logic.
