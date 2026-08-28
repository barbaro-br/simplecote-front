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
cotacoes.schema.ts   tipos (CotacaoResumo, CotacaoDetalhe, ItemCotacao, Participante, Resultado, Pedido) + zod de CriarCotacao/AbrirCotacao/CorrigirLance
cotacoes.api.ts      hooks: useCotacoes, useCotacao(id), useCriarCotacao, useDuplicarCotacao,
                     useAdicionarItem, useRemoverItem, useConvidarEmpresas, useReenviarConvite,
                     useAbrir, useEncerrar, useReabrir, useCancelar, useApurar,
                     useCorrigirLance, useReabrirParticipante,
                     useResultado(id), usePedidos(id), useEnviarPedido, baixarResultadoXlsx(id), baixarPedidoPdf(id)
CotacoesPage.tsx        lista + filtro por status (dashboard, rota index de /admin)
NovaCotacaoPage.tsx     form título + "duplicar de…"
CotacaoDetalhePage.tsx  orquestra: cabeçalho de status/ações, ItensSection, ParticipantesSection, RespostasSection
ResultadoPage.tsx       vencedores + pedidos + exportações
componentes: ConfirmarDialog, AbrirCotacaoDialog, ItensSection, ParticipantesSection, RespostasSection
```
Tipos derivados da resposta real do backend (conferir no Swagger durante a implementação); os union de status vêm de `shared/domain/tipos-base.ts`.

### 2. Rotas
`src/routes.tsx`: rota index de `/admin` passa a ser `<CotacoesPage />` (hoje é um `<div>`); adicionar `cotacoes/nova` → `<NovaCotacaoPage />`, `cotacoes/:id` → `<CotacaoDetalhePage />`, `cotacoes/:id/resultado` → `<ResultadoPage />`. `AdminLayout`: transformar "Cotações" (hoje `<div>`) num `<Link to="/admin">` (ou `/admin/cotacoes`).

### 3. Diálogo de confirmação
Um componente `ConfirmarDialog` (título, descrição da consequência, ação). Usado em `apurar` e `cancelar` obrigatoriamente; `abrir` usa um dialog próprio porque coleta o `prazo` (`<input type="datetime-local">` → ISO com timezone). `encerrar`/`reabrir` são reversíveis → sem dialog (ou um confirm leve). O texto da consequência de `apurar` segue o exemplo do `spec.md` regra 8.

### 4. Downloads binários (XLSX/PDF)
Adicionar ao `api-client` (ou um helper local em `cotacoes.api.ts`) uma função que faz `fetch` com o header `Authorization`, lê `response.blob()`, e dispara o download via `URL.createObjectURL` + `<a download>` temporário. Não é `useQuery` — é uma ação imperativa disparada por clique.

### 5. Correção de lance / respostas
A `RespostasSection` mostra, por participante, a grade item×lance vinda de `GET /{id}` (ou de um endpoint de respostas se existir — conferir o shape de `CotacaoResponse`). Editar um lance abre um mini-form (`preco` ou "não cotado") → `PUT /api/participantes/{pid}/lances/{itemId}`. "Reabrir resposta" é um botão por participante `RESPONDIDO`.

## Risks / Trade-offs

- **Shape das respostas do backend desconhecido em detalhe** (`CotacaoResponse`, `ResultadoDTO`, `GridAoVivoDTO`, `PedidoDTO`) → conferir no Swagger na implementação; se um campo esperado não existir (ex.: grade de respostas dentro de `GET /{id}`), pausar e decidir (endpoint adicional vs. derivar). 
- **`abrir` exige `prazo`** com timezone — usar `datetime-local` e converter para ISO-8601 com offset; o backend espera `OffsetDateTime`. Cobrir com teste.
- **Volume da change** — são ~5 telas. Mitigar: implementar na ordem lista → criar → detalhe(itens → convite → estado) → resultado, rodando `npx vitest run` a cada fatia; se estourar, `resultado`/`correção de lance` podem virar uma sub-change, mas o alvo é entregar tudo.
- **Depende de `alinhar-contrato-api`** para o `StatusCotacao` correto; se aplicada antes, usar o enum já corrigido; se não, esta change não deve redefinir o enum — apenas consumi-lo (e sinalizar se ainda estiver errado).
- **`AuthGuard` + backend com auth ligada** — a verificação e2e desta change depende de `ligar-front-ao-backend` ter deixado o login funcionando.

## Open Questions

- `GET /api/cotacoes/{id}` já devolve a grade de respostas (lances por participante×item) ou isso só vem de `GET /{id}/ao-vivo`? Resolver no Swagger na implementação: se a grade só existe no `ao-vivo`, a `RespostasSection` fora do polling usa uma leitura pontual desse mesmo endpoint (sem o `refetchInterval`), sem trazer a Fase 2 para o escopo.
