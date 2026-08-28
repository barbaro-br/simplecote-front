## 0. Pré-requisito (backend)

- [x] 0.1 `simplecote-back` expõe `GET /api/cotacoes/{id}/participantes` → `{id, empresaId, empresaNome, representanteNome, status, linkMagico}[]` e inclui `participanteId` em cada `Celula` do `GridAoVivoDTO` (ou um `GET /api/cotacoes/{id}/respostas` equivalente com `participanteId`). Bloqueia todas as tarefas abaixo.

## 1. Hooks

- [x] 1.1 Em `src/admin/cotacoes/cotacoes.api.ts`: `useParticipantes(id)` (`GET .../participantes`), `useConvidarEmpresas(id)` (`POST .../participantes` `{empresaIds}`), `useReenviarConvite` (`POST /api/participantes/{pid}/reenviar-convite`), `useAoVivo(id)` (`GET .../ao-vivo`, sem `refetchInterval`), `useCorrigirLance` (`PUT /api/participantes/{pid}/lances/{itemId}` `{preco?}`/`{naoCotado}`), `useReabrirParticipante` (`POST /api/participantes/{pid}/reabrir`), `useCorrecoes(id)` (`GET .../correcoes`). Tipos `Participante`, `GridAoVivo`, `ItemGrid`, `Celula`, `CorrecaoLance` no `cotacoes.schema.ts` a partir do shape real. Verificar: `npx tsc -b` verde.

## 2. ParticipantesSection

- [x] 2.1 `src/admin/cotacoes/ParticipantesSection.tsx`, montada na `CotacaoDetalhePage`: multi-seleção de Empresas ativas (`useEmpresas`) → `useConvidarEmpresas`; lista de participantes de `useParticipantes` com status de convite; botão "Reenviar" (`useReenviarConvite`) e "Copiar link" (`navigator.clipboard`). Verificar: teste MSW — convidar 2 Empresas → 2 participantes na lista; `ProblemDetail` de erro de convite é exibido sem alterar a lista.

## 3. RespostasSection

- [x] 3.1 `src/admin/cotacoes/RespostasSection.tsx`: grade item × Empresa de `useAoVivo(id)`; editar célula → mini-form (`preco` ou "não cotado") → `useCorrigirLance`; "Reabrir resposta" por participante `RESPONDIDO` → `useReabrirParticipante`. Verificar: teste MSW — corrigir um lance reflete o novo valor após `invalidate`; reabrir chama a API.

## 4. Fechamento

- [x] 4.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [x] 4.2 Verificado contra o backend vivo (`:8080`, contrato de `ler-participantes-da-cotacao`): `POST .../participantes` → `GET .../participantes` devolve `{participanteId, empresaId, empresaNome, representanteNome, conviteStatus, participanteStatus, linkMagico}` (bate com os tipos do front); `POST .../reenviar-convite` → `200`; `PUT /api/participantes/{pid}/lances/{itemId} {preco}` → `204` e a célula do `ao-vivo` reflete `preco`/`precoUnitario`/`status: COTADO` com o `participanteId` certo; `POST /api/participantes/{pid}/reabrir` → `422` para participante não-`RESPONDIDO` (regra de estado do backend — o front só mostra "Reabrir resposta" para `participanteStatus === 'RESPONDIDO'`, então não é divergência). **Sem correção de contrato necessária.**
- [x] 4.3 `openspec validate admin-cotacoes-participantes-respostas` sem erros.
