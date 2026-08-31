## Context

See `proposal.md` for the motivation of consolidating the detail view and making the quotation grid real-time. Currently, the detail view (`CotacaoDetalhePage`) contains static sections for items and responses, while the separate Live Grid (`GradeAoVivoPage`) uses a polling mechanism to fetch updates. We need to replace polling with Server-Sent Events (SSE) and embed the grid inside the detail view.

## Goals / Non-Goals

**Goals:**
- Implement a reusable hook or utility for SSE connection that consumes updates from `/api/cotacoes/{id}/ao-vivo/stream`.
- Remove the separate `/ao-vivo` route and migrate its interactive grid component into the main `CotacaoDetalhePage`.
- Gracefully handle SSE disconnects and reconnections.

**Non-Goals:**
- Refactoring the entire detail page layout beyond removing the old tabs/sections and adding the new grid.
- Modifying how bids (lances) are placed by the RCA (this change is scoped to the admin/buyer view).
- Implementing WebSocket (we will stick to SSE as it is a unidirectional stream from server to client, which fits this use case perfectly and is easier to support on HTTP/1.1 or standard load balancers).

## Decisions

**1. Use Server-Sent Events (SSE) instead of WebSockets**
- *Rationale*: Updates only flow from the server to the client (the backend notifies the front end that the grid has changed). SSE is simpler to implement (using native `EventSource`) and handles reconnections automatically.
- *Alternative Considered*: WebSockets were considered but are overkill for unidirectional data flow. Long-polling is what we currently simulate, but SSE provides lower latency and less overhead.

**2. State Management for the Live Grid**
- *Rationale*: We will introduce a hook `useGradeAoVivoSSE` that first fetches the initial state via the standard `GET /api/cotacoes/{id}/ao-vivo` (using React Query or standard fetch) and then opens an `EventSource` connection to the SSE endpoint to apply patches or full state replacements as events arrive.
- *Alternative Considered*: We could just invalidate the React Query cache upon receiving any SSE event. This is simple and effective. If the backend sends full state in the event payload, we can update the cache directly. Given simplicity, the initial implementation will just invalidate the query on `LanceAtualizado` events, triggering a standard fetch, or update the cache directly if the payload contains the new grid.

## Risks / Trade-offs

- **Risk:** SSE connection drops or corporate firewalls block long-lived HTTP requests.
  - *Mitigation:* `EventSource` has built-in reconnection logic. We can also fallback to polling if the connection fails repeatedly, though for this initial phase, we will rely on native SSE behavior.
- **Risk:** High frequency of events causing React render thrashing.
  - *Mitigation:* The backend should ideally debounce events, or the frontend can throttle the query invalidations.

## Migration Plan

1. Frontend creates the structure for SSE (`useGradeAoVivoSSE`).
2. Integrate `GradeAoVivoTabela` into `CotacaoDetalhePage`.
3. Drop `ItensSection` and `RespostasSection`.
4. Delete the `/ao-vivo` route and `GradeAoVivoPage`.
