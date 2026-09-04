## Why

Hoje não existe forma de remover um representante convidado por engano (ex.: um representante que só vende arroz numa cotação de material de construção) — a mudança irmã no repo `simplecote-back` (mesmo nome) adiciona `DELETE /api/participantes/{id}` para isso. Falta o botão no front.

## What Changes

- O círculo/check já usado à esquerda do avatar no modo Rascunho (marca/desmarca a seleção antes de abrir a Cotação) passa a aparecer também no modo Aberta, substituindo o botão "Convidar" que existe hoje só do lado direito. Marcado = já convidado (participante existe); clicar num desmarcado convida; clicar num marcado (quando o participante não é `Respondido`) pede confirmação e desconvida.
- Quando o participante é `Respondido`, o círculo aparece marcado mas não clicável — não dá pra desconvidar quem já finalizou (o backend rejeita).
- Ação de desconvidar é irreversível: exige diálogo de confirmação antes de chamar a API, mesmo padrão do "Excluir Cotação" já existente na lista de Cotações.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `admin/cotacoes`: novo requirement "Desconvidar um representante" no modal `RepresentantesModal`.

## Impact

- `src/admin/cotacoes/cotacoes.api.ts`: novo hook `useDesconvidarParticipante` (`DELETE /api/participantes/{id}`).
- `src/admin/cotacoes/RepresentantesModal.tsx`: o círculo/check (hoje só em `!isAberta`) passa a renderizar também em `isAberta`, com a lógica de convidar/desconvidar; remove o botão "Convidar" (absorvido pelo clique no círculo); diálogo de confirmação antes de desconvidar.
- Depende da proposta irmã no repo `simplecote-back` para o endpoint existir.
