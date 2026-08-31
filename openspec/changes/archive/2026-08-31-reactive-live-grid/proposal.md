## Why

The current detail page for a quotation ("Cotação") displays "Itens" and "Respostas" as static cards, and delegates the live tracking (Grade Ao Vivo) to a separate page (`/admin/cotacoes/:id/ao-vivo`). The user experience can be streamlined by replacing these static cards with the live grid directly on the detail page. Furthermore, the live grid currently relies on polling (or is non-reactive in the eyes of the user) when a representative (RCA) responds. The goal is to make this grid reactive by implementing Server-Sent Events (SSE) so the backend can push updates to the frontend instantaneously when a response is received.

## What Changes

- Replace the "Itens" and "Respostas" sections in `CotacaoDetalhePage` with the `GradeAoVivoTabela` component.
- Keep the table interactive (able to edit prices, etc.) directly on the detail page.
- Add Server-Sent Events (SSE) support in the frontend (`useGradeAoVivoSSE` or similar) to listen for live updates from the backend when a quotation is in the `ABERTA` state.
- **BREAKING**: The backend will need to implement an SSE endpoint (e.g., `/api/cotacoes/{id}/ao-vivo/stream`) to emit events when a bid (lance) is placed or changed. (This proposal focuses on the frontend change, but notes the required backend contract).

## Capabilities

### New Capabilities
- `admin/cotacoes-live-stream`: Real-time Server-Sent Events stream for quotation updates.

### Modified Capabilities
- `admin/cotacoes`: The quotation detail view behavior changes to display the live grid directly instead of separate static tabs, and it consumes real-time events.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx`: Will be heavily modified to remove `ItensSection` and `RespostasSection` and include `GradeAoVivoTabela`.
- `src/admin/cotacoes/cotacoes.api.ts`: Needs a new hook/logic to consume SSE instead of or in addition to polling.
- Back-end (`simplecote-back`): Will need an SSE endpoint to push updates. This proposal will outline the frontend expectations for that endpoint.
