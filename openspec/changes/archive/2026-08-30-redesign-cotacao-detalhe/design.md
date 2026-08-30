## Context
See proposal.md for motivation. This change implements a new UI for the quotation details page, modifying React components in `src/admin/cotacoes/`. The Figma prototype provided is a visual reference for how to restructure these components.

## Goals / Non-Goals

**Goals:**
- Implement the sticky header pattern.
- Relocate the participant invitation logic to a modal (`InviteModal.tsx`) instead of an inline section.
- Implement the numeric stepper in `ItensSection.tsx`.
- Enhance the UI styling of `ItensSection.tsx` and `ParticipantesSection.tsx`.

**Non-Goals:**
- Implementing backend logic for updating item quantities (the frontend will mock this API call or assume it exists/will exist).
- Rewriting the data fetching logic (React Query hooks remain the same).

## Decisions
- **Participant Modal**: We will extract the invitation logic from `ParticipantesSection.tsx` into a new `InviteModal.tsx` component that is controlled by a state in `CotacaoDetalhePage.tsx`.
- **Item Quantity Edit**: A stepper input will be added to the items table. We will check if `useAdicionarItem` can serve as an upsert, or we will just use standard local state for now and defer API integration if the endpoint is missing.

## Risks / Trade-offs
- **Risk**: The stepper might trigger too many API calls if not debounced.
- **Mitigation**: We should ideally debounce the quantity change or require a blur event to save, or wait for backend support to finalize the integration.
