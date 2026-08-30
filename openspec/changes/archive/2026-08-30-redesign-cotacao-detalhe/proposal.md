## Why

The current "Detalhes da Cotação" screen in the admin panel has usability issues when dealing with large quotations (e.g., 200+ items). The header disappears on scroll, the participant invitation form is pushed far down the page making it hard to reach, and the items list lacks clear quantity indicators and quick-edit actions. This change improves the UX/UI based on a new Figma prototype to make managing large quotations more efficient.

## What Changes

- **Sticky Header**: The quotation header (title, status, and action buttons) will remain fixed at the top while scrolling.
- **Invite Representatives Modal**: The participant invitation section will be moved from the bottom of the page into a modal dialog, accessible via a "Representantes" button in the sticky header.
- **Enhanced Items Table**:
  - The "Embalagem" column will display both the packaging type and the quantity per packaging (e.g., `Caixa (12x)`).
  - The "Qtd. Solicitada" column will use a numeric stepper input, allowing the buyer to easily adjust the quantity.
  - The "Remover" action text will be replaced with a trash icon.
  - Rows will have zebra striping to improve readability.
- **Participant Table**: Redesigned to use an actions menu (three dots) for secondary actions like removing a participant.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin/cotacoes`: Updating the UI requirements for the quotation details screen, specifically the placement of the participant invitation form (now a modal) and the addition of editable quantities in the items list.

## Impact

- **UI Components**: `CotacaoDetalhePage.tsx`, `ItensSection.tsx`, `ParticipantesSection.tsx`.
- **New Components**: `InviteModal.tsx` will be created.
- **API (Future/Note)**: The stepper in the items list requires an endpoint to update item quantities. If `PATCH /api/cotacoes/:id/itens/:itemId` is not yet available in the backend, the UI will implement the stepper but may need to mock the update or wait for backend integration.
