## Context

Ver `proposal.md` — Why. Estado atual do front:

- Padrão por feature em `src/admin/<feature>/`: `<feature>.api.ts` (usa `src/shared/api/api-client.ts` — já injeta `Authorization`, converte `ProblemDetail` → `ApiError`, trata 401 → sessão expirada), `<feature>.schema.ts` (zod validando a resposta), `<feature>.test.tsx` (MSW). Fatia de referência: `src/admin/produtos/`.
- `src/admin/cotacoes/UltimaCompraPopover.tsx` já é um popover hand-rolled de "última compra por produto", usado hoje em `GradeAoVivoTabela` (dentro de `GradeAoVivoPage`). Consome o campo `ultimaCompra*` que já vem no `ItemGrid` da grade — **não** faz fetch próprio.
- `CotacoesPage.tsx` é a index de `/admin` (lista de cotações, provavelmente com algum filtro por status). `ItensSection.tsx` = itens de uma cotação em rascunho + seletor "adicionar produto". `ParticipantesSection.tsx` = empresas convidadas.
- TanStack Query 5 já instalado e usado. `src/shared/format/formatters.ts` tem dinheiro/data pt-BR. Kit UI: `card`, `skeleton`, `button`, `icon-button`, `menu-acoes`, `dialog`, `toggle-duplo`. Sem primitivo de popover/tooltip além do `UltimaCompraPopover`.
- Sem `recharts`. Sem rota `/admin/analise*`.
- Backend `insights-de-compra` no ar: `GET /api/analises/{dashboard, produtos/insight?ids=, empresas/{id}/insight}` (shapes no `proposal.md` e no spec `analise` do back).

## Goals / Non-Goals

**Goals:**
- Um módulo de leitura `src/admin/analise/` (api + schema + testes) que isola o contrato dos 3 endpoints.
- Os widgets nunca quebram a tela hospedeira: erro/offline/vazio são estados locais do widget.
- O hover de produto faz **uma** chamada por conjunto visível, não N.
- A grade ao vivo (`GradeAoVivoPage`) continua idêntica em comportamento.

**Non-Goals (nível de design):**
- Nenhum primitivo genérico de tooltip/popover — estende-se o padrão do `UltimaCompraPopover`.
- Nenhuma dependência (sparkline é `<svg>` à mão com `<polyline>`; 0..6 pontos).
- Nenhuma tela nova nem rota nova. Nenhuma mudança de contrato no backend.
- `/admin/analise` com Recharts: change futura.
- Prefetch global de insight fora das telas de cotação.

## Decisions

### 1. Módulo `src/admin/analise/`

`analise.schema.ts` — 3 schemas zod: `dashboardSchema`, `insightProdutoSchema` + `insightProdutosMapSchema` (`z.record(z.string().uuid(), insightProdutoSchema)`), `insightEmpresaSchema`. Campos monetários/`variacaoPct` como `z.string()` (o back manda `BigDecimal` serializado); datas como `z.string()` ISO. Todos os `*|null` explicitamente `.nullable()`.

`analise.api.ts` — 3 funções: `buscarDashboard()`, `buscarInsightProdutos(ids: string[])` (monta `?ids=a,b,c`; **não chama** se `ids` vazio — retorna `{}`), `buscarInsightEmpresa(empresaId)`. Cada uma faz `apiClient.get(...)` e valida com o schema; erro de schema vira `ApiError` genérico (log em dev).

- Alternativa: pendurar em `cotacoes.api.ts`. Rejeitada — análise é um domínio de leitura próprio, cresce (a tela de gráficos futura mora aqui também).

### 2. Cabeçalho de dashboard — `PainelDashboard` em `CotacoesPage`

Componente `src/admin/analise/PainelDashboard.tsx`, renderizado no topo de `CotacoesPage`. `useQuery({ queryKey: ['analise','dashboard'], queryFn: buscarDashboard, staleTime: 60_000, retry: 1 })`.

- `isPending` → faixa de `skeleton`.
- `isError` → **renderiza `null`** (some, sem toast). A `CotacoesPage` não muda seu próprio fluxo.
- sucesso → grid de `card`s. Cada card é um subcomponente puro recebendo já o pedaço do DTO.
- "precisa de ação" / atalho de status: reusa o mecanismo de filtro que `CotacoesPage` já tiver. Se o filtro for estado interno, expõe um setter; se não existir, navega com query param (`/admin?status=ENCERRADA`) e a página passa a ler esse param. Decidir na implementação lendo `CotacoesPage.tsx`; registrar o que foi feito.
- prazos relativos: helper local `prazoRelativo(fechaEm)` ("vence em N dias" / "venceu há N dias" com classe de atraso). Não vale dependência de date-lib.

### 3. Hover de produto — refatorar `UltimaCompraPopover` em dois

- **`InsightProdutoCard.tsx`** (novo, em `src/admin/analise/`): componente **puro** que recebe `insight: InsightProduto | null | 'erro'` e desenha o card (última compra, badge de variação, menor/média, contagens, `<Sparkline pontos={serie} />`, atalho para `/admin/cotacoes/:cotacaoId/resultado`). `null` → "sem histórico"; `'erro'` → "insight indisponível".
- **`Sparkline.tsx`** (novo): `<svg><polyline points=.../></svg>` a partir de `serie` (0..6 pontos); ≤1 ponto → não desenha linha.
- **`UltimaCompraPopover.tsx`**: continua exportando o mesmo componente que a grade ao vivo usa, mas seu corpo passa a renderizar `InsightProdutoCard`. A grade ao vivo **já tem** `ultimaCompra*` no `ItemGrid`; para não quebrar nem forçar fetch lá, o popover aceita: (a) um `insight` já pronto (caminho novo, telas de cotação) OU (b) os campos soltos de última compra (caminho atual da grade), adaptando-os para o formato do card com série vazia. Assinatura retrocompatível — os testes de `GradeAoVivoPage` não mudam.
- **Lote nas telas de cotação**: um hook `useInsightProdutos(ids: string[])` em `src/admin/analise/`:
  - `useQuery({ queryKey: ['analise','insight-produtos-lote', [...ids].sort()], queryFn: () => buscarInsightProdutos(ids), enabled: ids.length > 0, staleTime: 60_000 })`.
  - no `onSuccess`/`useEffect`, faz `queryClient.setQueryData(['analise','insight-produto', id], mapa[id] ?? null)` para cada id — inclusive `null` para ids do comprador ausentes do mapa (produto nunca comprado) e para ids fora do mapa (não é do comprador; o card mostra "sem histórico" também, é indistinguível e tudo bem).
  - `InsightProdutoCard` no hover lê `useQuery(['analise','insight-produto', id])` do cache; se ausente (lote ainda não voltou) → estado de carregando.
  - `ItensSection` chama `useInsightProdutos` com os `produtoId` dos itens **+** os do resultado do seletor de produto atualmente renderizado.

- Alternativa: fetch por produto no hover (com `staleTime` alto). Rejeitada — abrir uma cotação com 40 itens dispararia 40 requests no primeiro hover-sweep; o spec exige lote.
- Alternativa: enriquecer `GET /api/produtos` com o insight. Rejeitada — é mudança de back, e engorda a listagem sempre.

### 4. Hover de empresa — `InsightEmpresaCard` em `ParticipantesSection`

`src/admin/analise/InsightEmpresaCard.tsx` + hook `useInsightEmpresa(empresaId, { enabled })`. `useQuery({ queryKey: ['analise','insight-empresa', empresaId], queryFn: () => buscarInsightEmpresa(empresaId), enabled, staleTime: 300_000, retry: false })`.

- `enabled` liga no primeiro hover/focus da Empresa (estado `hovered` no item da lista) e fica ligado (cacheado) depois.
- `isError` (inclui 422) e dados zerados → card "sem dados de relacionamento". `retry: false` porque 422 não é transitório.
- `tempoMedioRespostaSegundos` → helper `duracaoAprox(seg)` → "~2 h" / "~35 min" / "~1 dia".

### 5. Popover mecânico

Reusa o esqueleto de posicionamento/portal/dismiss do `UltimaCompraPopover` atual. Se hoje ele for muito acoplado a "última compra", extrai-se um `HoverCard.tsx` (só trigger + painel flutuante + acessibilidade: abre em `mouseenter`/`focus`, fecha em `mouseleave`/`blur`/`Esc`, `role="tooltip"`), e os 3 cards viram conteúdo. Não é "primitivo genérico de tooltip" — é o mesmo padrão que já existe, só nomeado.

### 6. Formatação e estados

- Dinheiro: `formatters.ts` (as strings do back → `Number` → formatador). Datas: idem. `variacaoPct`: `Number(str)`, 1 casa, sinal, seta ↑/↓ e cor (subiu = vermelho/alerta, desceu = verde).
- Todo widget: `pending` = skeleton; `error` = fallback textual **dentro do widget** ou o widget some (dashboard). Nunca `throw`, nunca toast global, nunca Error Boundary da página.

## Risks / Trade-offs

- **Refactor do `UltimaCompraPopover`** pode regredir a grade ao vivo → assinatura retrocompatível (aceita os campos soltos atuais) + rodar `GradeAoVivoPage.test.tsx` / `GradeAoVivoTabela` sem alteração. É tarefa explícita.
- **Chave do lote `['...lote', ids.sort()]`** muda a cada item adicionado/removido na cotação → aceitável: `staleTime` 60s absorve, e o volume é pequeno. Não usar `keepPreviousData` para não mostrar insight de produto que saiu da lista.
- **`z.record` com chave UUID**: zod aceita, mas o back pode mandar `{}` (mapa vazio) — coberto no schema e no teste.
- **`ids` grande na URL**: o back limita a 200 e as telas de cotação raramente passam de algumas dezenas de itens; sem paginação do lado do front.
- **Distinguir "produto nunca comprado" de "não é do comprador"**: o front não distingue (ambos → "sem histórico"). Aceitável — o admin só vê produtos dele nessas telas.
- **`prazoRelativo`/`duracaoAprox` à mão**: pouco código, testável; evita dependência de date-fns/dayjs só por isso.
