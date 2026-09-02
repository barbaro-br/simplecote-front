## Why

Atualmente, se o disparo de e-mails de convite falhar (ex: por erro no SMTP do Brevo) ou o usuário quiser reenviar um convite manualmente na tela de "Representantes" de uma cotação já aberta, a interface apenas exibe um toast informando que o disparo em lote "não está implementado". O backend já possui uma rota `POST /api/participantes/{participanteId}/reenviar-convite` para reenviar, mas o frontend não consome essa rota. Implementar esse disparo no frontend é necessário para garantir que o comprador possa re-notificar representantes sem precisar criar uma nova cotação.

## What Changes

- Implementar a função `handleDispararTodosEmail` no `RepresentantesModal.tsx` para chamar a rota de reenvio de convites individual do backend para todos os convites pendentes/falhos.
- Atualizar a interface do modal de Representantes enquanto os e-mails estão sendo disparados (ex: botão de loading).

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin/cotacoes`: O modal de representantes de uma cotação `ABERTA` deverá processar o reenvio de convites de e-mail para todos os representantes cujo status de convite não seja `ENVIADO`.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`
- Rota da API `/api/participantes/{participanteId}/reenviar-convite` será consumida.
