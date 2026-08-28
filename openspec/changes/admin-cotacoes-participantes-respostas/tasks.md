## 0. Pré-requisito (backend)

- [ ] 0.1 `simplecote-back` expõe `GET /api/cotacoes/{id}/participantes` → `{id, empresaId, empresaNome, representanteNome, status, linkMagico}[]` e inclui `participanteId` em cada `Celula` do `GridAoVivoDTO` (ou um `GET /api/cotacoes/{id}/respostas` equivalente com `participanteId`). Bloqueia todas as tarefas abaixo.

## 1. Hooks

- [ ] 1.1 Em `src/admin/cotacoes/cotacoes.api.ts`: `useParticipantes(id)` (`GET .../participantes`), `useConvidarEmpresas(id)` (`POST .../participantes` `{empresaIds}`), `useReenviarConvite` (`POST /api/participantes/{pid}/reenviar-convite`), `useAoVivo(id)` (`GET .../ao-vivo`, sem `refetchInterval`), `useCorrigirLance` (`PUT /api/participantes/{pid}/lances/{itemId}` `{preco?}`/`{naoCotado}`), `useReabrirParticipante` (`POST /api/participantes/{pid}/reabrir`), `useCorrecoes(id)` (`GET .../correcoes`). Tipos `Participante`, `GridAoVivo`, `ItemGrid`, `Celula`, `CorrecaoLance` no `cotacoes.schema.ts` a partir do shape real. Verificar: `npx tsc -b` verde.

## 2. ParticipantesSection

- [ ] 2.1 `src/admin/cotacoes/ParticipantesSection.tsx`, montada na `CotacaoDetalhePage`: multi-seleção de Empresas ativas (`useEmpresas`) → `useConvidarEmpresas`; lista de participantes de `useParticipantes` com status de convite; botão "Reenviar" (`useReenviarConvite`) e "Copiar link" (`navigator.clipboard`). Verificar: teste MSW — convidar 2 Empresas → 2 participantes na lista; `ProblemDetail` de erro de convite é exibido sem alterar a lista.

## 3. RespostasSection

- [ ] 3.1 `src/admin/cotacoes/RespostasSection.tsx`: grade item × Empresa de `useAoVivo(id)`; editar célula → mini-form (`preco` ou "não cotado") → `useCorrigirLance`; "Reabrir resposta" por participante `RESPONDIDO` → `useReabrirParticipante`. Verificar: teste MSW — corrigir um lance reflete o novo valor após `invalidate`; reabrir chama a API.

## 4. Fechamento

- [ ] 4.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [ ] 4.2 Verificação contra o backend vivo: convidar Empresa → representante responde (ou admin corrige) → reabrir resposta. Registrar divergências de contrato.
- [ ] 4.3 `openspec validate admin-cotacoes-participantes-respostas` sem erros.
