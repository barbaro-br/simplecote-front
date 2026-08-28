## Context

Ver `proposal.md` — Why. `admin-cotacoes` já criou `src/admin/cotacoes/` (schema, api, `CotacaoDetalhePage` com cabeçalho de status, `ItensSection`, ações de estado, `ResultadoPage`). Esta change só acrescenta duas seções à `CotacaoDetalhePage` e os hooks correspondentes.

Contrato atual conferido (`GET /v3/api-docs` do backend em execução):

- `POST /api/cotacoes/{id}/participantes` (`{empresaIds: uuid[]}`) → `201` `ParticipanteResponse[]` = `{id, representanteId, status: CONVIDADO|VISUALIZOU|RESPONDIDO, linkMagico}`.
- `POST /api/participantes/{pid}/reenviar-convite` → `200`.
- `POST /api/participantes/{pid}/reabrir` → `200`.
- `PUT /api/participantes/{pid}/lances/{itemId}` (`{preco?: number>=0, naoCotado?: boolean}`) → `204`.
- `GET /api/cotacoes/{id}/ao-vivo` → `GridAoVivoDTO` = `{status, respondidos, totalParticipantes, itens: ItemGrid[]}`; `ItemGrid` = `{itemCotacaoId, nome, unidade, quantidadePorEmbalagem, quantidadeSolicitada, ultimoPrecoUnitario, menorPrecoUnitario, precos: Celula[]}`; `Celula` = `{empresaId, empresa, preco, precoUnitario, status: COTADO|NAO_COTADO|PENDENTE}`.
- `GET /api/cotacoes/{id}/correcoes` → `CorrecaoLanceDTO[]`.

## Goals / Non-Goals

**Goals:**
- Convite de Empresas + lista de participantes persistente (sobrevive a reload).
- Correção de lance e reabertura de resposta a partir do detalhe.

**Non-Goals:**
- Polling da grade ao vivo (`refetchInterval`) — Fase 2, change própria.
- Qualquer recálculo de preço/vencedor no front.
- Mudar o fluxo do representante (`representante-cotacao-token`).

## Decisions

### 1. Pré-requisito de backend
Esta change só arranca quando o `simplecote-back` expuser:
1. `GET /api/cotacoes/{id}/participantes` → `{id, empresaId, empresaNome, representanteNome, status, linkMagico}[]`.
2. `participanteId` em cada `Celula` do `GridAoVivoDTO` (ou um endpoint de respostas com `participanteId`).

Sem (1) não há lista de participantes após reload; sem (2) não há como ligar uma célula da grade ao `PUT .../participantes/{participanteId}/lances/{itemId}`.

- Alternativa rejeitada — derivar no cliente: `representanteId → GET /api/representantes → empresaId`, e casar `empresaId` da `Celula` com o participante. Frágil (N+1 chamadas, e a lista de participantes ainda não persiste). Só faz sentido como gambiarra temporária, não como design.

### 2. `RespostasSection` = leitura pontual de `ao-vivo`
`useAoVivo(id)` é um `useQuery` **sem** `refetchInterval` (polling fica para a Fase 2). A grade é item (linha) × Empresa (coluna); cada célula mostra `preco`/`precoUnitario`/`status`. Editar abre um mini-form (`preco` ou checkbox "não cotado") → `useCorrigirLance` → `invalidateQueries(['cotacao', id, 'ao-vivo'])`.

### 3. Reuso
`ParticipantesSection` usa `useEmpresas()` de `@/admin/empresas/empresas.api` para o seletor de Empresas ativas. "Copiar link" usa `navigator.clipboard.writeText` com fallback.

## Risks / Trade-offs

- **Backend pode expor um shape diferente** do proposto na Decisão 1 → ajustar os tipos quando o endpoint existir; a estrutura das seções não muda.
- **`navigator.clipboard` em teste (jsdom)** → mockar no teste.
- **Sem `participanteId` na `Celula` mesmo depois do endpoint de participantes** → a correção de lance precisa do cruzamento `empresaId → participanteId` via a lista de participantes (aceitável se a lista tiver `empresaId`).
