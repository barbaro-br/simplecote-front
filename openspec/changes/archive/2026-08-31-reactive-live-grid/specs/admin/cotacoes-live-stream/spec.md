## Purpose
Real-time Server-Sent Events (SSE) stream for instantaneous quotation updates.

## ADDED Requirements

### Requirement: SSE Endpoint
The system SHALL provide an SSE endpoint to stream events for a specific quotation.

#### Scenario: Subscribing to the stream
- **WHEN** a client connects to the SSE endpoint for an `ABERTA` quotation
- **THEN** the stream opens and pushes quotation update events

#### Scenario: Receiving an update event
- **WHEN** an RCA places or changes a bid
- **THEN** the system pushes an update event (e.g. `LanceAtualizado`) through the active SSE stream so connected clients can update immediately
