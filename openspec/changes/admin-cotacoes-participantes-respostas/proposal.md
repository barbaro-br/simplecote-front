## Why

`admin-cotacoes` entrega o ciclo de vida da Cotação no painel (criar, itens, abrir/encerrar/reabrir/cancelar/apurar, resultado), mas **convidar Empresas** e **corrigir lance / reabrir resposta pelo admin** ficaram de fora: o contrato atual do `simplecote-back` não dá como carregar esses dados numa tela que sobrevive a um reload.

Gaps no backend (conferidos em `GET /v3/api-docs`):

- Não existe `GET /api/cotacoes/{id}/participantes`. Só `POST .../participantes` devolve a lista (`ParticipanteResponse[]`), então ao recarregar `/admin/cotacoes/:id` não há de onde ler os participantes, o status de convite nem o link mágico.
- `ParticipanteResponse` = `{id, representanteId, status, linkMagico}` — não identifica a Empresa (nome/id).
- `GridAoVivoDTO.Celula` traz `empresaId`/`empresa`, mas **não** `participanteId` — e a correção de lance exige `PUT /api/participantes/{participanteId}/lances/{itemId}`.

## What Changes

- **Depende de `simplecote-back`** expor:
  - `GET /api/cotacoes/{id}/participantes` → lista de `{id (participanteId), empresaId, empresaNome, representanteNome, status, linkMagico}`.
  - `participanteId` (e idealmente `empresaId`) em cada `Celula` do `GridAoVivoDTO`, ou um `GET /api/cotacoes/{id}/respostas` equivalente.
- **`ParticipantesSection`** em `CotacaoDetalhePage`: multi-seleção de Empresas ativas (`useEmpresas`) → `POST /api/cotacoes/{id}/participantes` (`{empresaIds}`); lista de participantes com status de convite; "Reenviar convite" (`POST /api/participantes/{pid}/reenviar-convite`); "Copiar link mágico".
- **`RespostasSection`** em `CotacaoDetalhePage`: grade item × Empresa a partir de uma leitura pontual de `GET /api/cotacoes/{id}/ao-vivo` (`GridAoVivoDTO`, sem `refetchInterval` — polling é Fase 2); editar um lance → `PUT /api/participantes/{pid}/lances/{itemId}` (`{preco?}` / `{naoCotado:true}`); "Reabrir resposta" por participante `RESPONDIDO` → `POST /api/participantes/{pid}/reabrir`. Opcional: histórico de correções via `GET /api/cotacoes/{id}/correcoes`.
- `cotacoes.api.ts` ganha: `useParticipantes(id)`, `useConvidarEmpresas(id)`, `useReenviarConvite`, `useAoVivo(id)` (leitura pontual), `useCorrigirLance`, `useReabrirParticipante`, `useCorrecoes(id)`.
- Testes MSW: convite de 2 Empresas, erro `ProblemDetail` de convite, correção de lance reflete o novo valor, reabrir chama a API.

## Capabilities

### New Capabilities
Nenhuma capability nova de spec — completa a capability `admin/cotacoes` iniciada em `admin-cotacoes` com os requisitos "Convidar Empresas" e "Correção de lance e reabertura de resposta pelo admin".

### Modified Capabilities
Nenhuma.

## Impact

- Edição: `src/admin/cotacoes/cotacoes.api.ts`, `src/admin/cotacoes/CotacaoDetalhePage.tsx`; novos `ParticipantesSection.tsx`, `RespostasSection.tsx` + testes.
- **Bloqueada** até o `simplecote-back` expor o `GET` de participantes e o `participanteId` na grade. Enquanto isso, `CotacaoDetalhePage` não mostra participantes nem respostas.
- Não traz polling/Fase 2 (grade ao vivo com `refetchInterval`) para o escopo.
