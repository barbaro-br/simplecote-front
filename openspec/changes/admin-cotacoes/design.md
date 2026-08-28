## Context

Ver `proposal.md` — Why. Estado atual:

- `src/routes.tsx`: `/admin` → `AuthGuard` > `AdminLayout` > (index `<div>Dashboard</div>`, `produtos`, `empresas`). Não há rotas de cotações.
- Padrão da fatia de referência (`spec.md` §16): `feature/feature.schema.ts` (zod + tipos), `feature/feature.api.ts` (hooks TanStack Query, único ponto que conhece o path), páginas que só orquestram, `Form` com `react-hook-form`, testes com MSW compartilhado (`src/setupTests.ts`).
- `api-client` já tem `get/post/put/delete`. Downloads binários (XLSX/PDF) ainda não têm caminho no `api-client`.
- Backend endpoints (todos sob `/api/cotacoes` salvo indicado): `POST ""`, `GET ""`, `GET /{id}`, `POST /{id}/itens`, `DELETE /{id}/itens/{itemId}`, `POST /{id}/participantes` (`{empresaIds}`), `POST /{id}/abrir` (`{prazo}`), `POST /{id}/{encerrar|reabrir|cancelar|apurar}`, `GET /{id}/resultado`, `GET /{id}/resultado.xlsx`, `GET /{id}/pedidos`, `POST /{id}/duplicar`. Participante: `PUT /api/participantes/{pid}/lances/{itemId}`, `POST /api/participantes/{pid}/{reabrir|reenviar-convite}`. Pedido: `POST /api/pedidos/{id}/enviar`, `GET /api/pedidos/{id}.pdf`.

## Goals / Non-Goals

**Goals:**
- Ciclo de vida completo da Cotação operável pelo painel, com o mínimo de estado local.
- Reuso do padrão de feature-folder já estabelecido.
- Confirmação explícita antes de `apurar`/`cancelar`.

**Non-Goals:**
- Grade ao vivo com polling (`GET /{id}/ao-vivo`) — Fase 2, change própria.
- Scanner de código de barras / importação de catálogo — Fase 3.
- Recalcular qualquer coisa de domínio no front (vencedor, preço unitário, se pode abrir) — vem pronto da API.
- Otimistic updates elaborados nas transições de estado — `invalidateQueries` no `onSuccess` basta.

## Decisions

### 1. Estrutura de `src/admin/cotacoes/`
```
cotacoes.schema.ts   tipos (CotacaoResumo, CotacaoDetalhe, ItemCotacao, ItemOmitido, CotacaoDuplicada,
                     Pedido, ItemPedido, Resultado) + zod de CriarCotacao/AbrirCotacao/AdicionarItem
cotacoes.api.ts      hooks: useCotacoes, useCotacao(id), useCriarCotacao, useDuplicarCotacao,
                     useAdicionarItem, useRemoverItem,
                     useAbrir, useEncerrar, useReabrir, useCancelar, useApurar,
                     useResultado(id), usePedidos(id), useEnviarPedido, baixarResultadoXlsx(id), baixarPedidoPdf(id)
CotacoesPage.tsx        lista + filtro por status (dashboard, rota index de /admin)
NovaCotacaoPage.tsx     form título + "duplicar de…"
CotacaoDetalhePage.tsx  orquestra: cabeçalho de status/ações, ItensSection
ResultadoPage.tsx       vencedores (derivados de pedidos) + pedidos + exportações
componentes: ConfirmarDialog, AbrirCotacaoDialog, ItensSection
```
Tipos derivados do contrato real (`GET /v3/api-docs` do backend em execução): `CotacaoResponse` = `{id,titulo,status,prazo,criadaEm,encerradaEm,itens[]}` (sem participantes/lances); `ItemCotacaoResponse` usa campos `*Snapshot`; `AdicionarItemRequest` = `{produtoId,quantidade}`; `ResultadoDTO` = `{pedidos:PedidoDTO[], itensSemVencedor:ItemCotacaoResponse[]}`. Os union de status vêm de `shared/domain/tipos-base.ts` (já batem com o enum do backend — `alinhar-contrato-api` não é bloqueio).

> `ParticipantesSection` / `RespostasSection` / `useConvidarEmpresas` / `useReenviarConvite` / `useCorrigirLance` / `useReabrirParticipante` / leitura de `ao-vivo` e `correcoes` **saíram para `admin-cotacoes-participantes-respostas`** — o backend não tem `GET` de participantes, `ParticipanteResponse` não identifica a Empresa, e `Celula` do `GridAoVivoDTO` não traz `participanteId`.

### 2. Rotas
`src/routes.tsx`: rota index de `/admin` passa a ser `<CotacoesPage />` (hoje é um `<div>`); adicionar `cotacoes/nova` → `<NovaCotacaoPage />`, `cotacoes/:id` → `<CotacaoDetalhePage />`, `cotacoes/:id/resultado` → `<ResultadoPage />`. `AdminLayout`: transformar "Cotações" (hoje `<div>`) num `<Link to="/admin">` (ou `/admin/cotacoes`).

### 3. Diálogo de confirmação
Um componente `ConfirmarDialog` (título, descrição da consequência, ação). Usado em `apurar` e `cancelar` obrigatoriamente; `abrir` usa um dialog próprio porque coleta o `prazo` (`<input type="datetime-local">` → ISO com timezone). `encerrar`/`reabrir` são reversíveis → sem dialog (ou um confirm leve). O texto da consequência de `apurar` segue o exemplo do `spec.md` regra 8. Sem lib de dialog (shadcn dialog não está instalado) — um overlay simples com `role="dialog"` e foco no botão de confirmar.

### 4. Downloads binários (XLSX/PDF)
Adicionar ao `api-client` (ou um helper local em `cotacoes.api.ts`) uma função que faz `fetch` com o header `Authorization`, lê `response.blob()`, e dispara o download via `URL.createObjectURL` + `<a download>` temporário. Não é `useQuery` — é uma ação imperativa disparada por clique.

### 5. Resultado → "vencedor por item" derivado
`GET /{id}/resultado` (`ResultadoDTO`) devolve `pedidos[]` (um por Empresa vencedora) + `itensSemVencedor[]`. Não há uma lista plana item→vencedor: a `ResultadoPage` percorre `pedidos[].itens[]` e, para cada `itemCotacaoId`, exibe o `pedido.empresaNome` como vencedor e os preços (`precoEmbalagem`, `precoUnitario`, `subtotal`) que já vêm prontos. `itensSemVencedor` lista os itens sem lance. Nenhum cálculo de domínio no front.

## Risks / Trade-offs

- **Contrato conferido no `GET /v3/api-docs` do backend vivo** (feito na fase de descoberta). Divergências estruturais em participantes/respostas → movidas para `admin-cotacoes-participantes-respostas` (escolha do usuário). O resto do contrato bate.
- **`abrir` exige `prazo`** com timezone — o campo é `<input type="datetime-local">` (valor sem offset) convertido para ISO-8601 com offset via `new Date(local).toISOString()`. Cobrir com teste.
- **Volume da change** — telas: lista → criar → detalhe (itens + estado) → resultado, rodando `npx vitest run` a cada fatia.
- **`StatusCotacao`** de `shared/domain/tipos-base.ts` já bate com o enum do backend (`RASCUNHO|ABERTA|ENCERRADA|PEDIDOS_GERADOS|CANCELADA`) — `alinhar-contrato-api` não é pré-requisito.
- **`AuthGuard` + backend com auth ligada** — a verificação e2e depende de `ligar-front-ao-backend` (já validado).

## Open Questions

- ~~`GET /api/cotacoes/{id}` já devolve a grade de respostas?~~ **Resolvido**: não — `CotacaoResponse` só tem `itens[]` (snapshots dos produtos, sem lances). A grade de respostas está em `GET /{id}/ao-vivo` (`GridAoVivoDTO`); consumi-la faz parte de `admin-cotacoes-participantes-respostas`.
