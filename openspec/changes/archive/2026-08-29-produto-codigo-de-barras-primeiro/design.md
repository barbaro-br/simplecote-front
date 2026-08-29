## Context

Ver `proposal.md`. Estado:

- `ProdutoForm`: `react-hook-form` + `zod`, campos na ordem nome → codigoBarras (opcional) → unidade → quantidade. `codigoBarras: z.string().optional()`.
- Backend: `GET /api/produtos/lookup?gtin=<x>` → `DadosProdutoExternoDTO` (200) ou `404` (não encontrado, documentado como normal). `api-client` tem `api.get(endpoint, { lookup: true })` → `404` sem `problem+json` vira `null`.
- `DadosProdutoExternoDTO` — conferir o shape real no Swagger do back em execução; provável `{ nome, ... }`.

## Goals / Non-Goals

**Goals:**
- Código de barras é o primeiro passo; "Buscar" traz o nome.
- Não encontrado / falha → degrada pra preenchimento manual, nunca bloqueia.

**Non-Goals:**
- Scanner de câmera (`@zxing/browser`, Fase 3) — só o campo de texto + botão por ora.
- Auto-buscar ao digitar (debounce) — botão explícito evita rajada de request no provedor sem SLA.
- Persistir/cachear resultados de lookup.

## Decisions

### 1. Bloco "código de barras + buscar" no topo do form
Primeiro grupo do `ProdutoForm`: `<Input>` do código de barras + `<Button type="button">Buscar</Button>` (não é submit). Abaixo, um slot de status: idle / buscando / "nome sugerido pelo código de barras" / "não encontrado — preencha manualmente".

### 2. `useLookupProdutoPorGtin` — mutation, não query
É uma ação sob demanda (clique), então `useMutation({ mutationFn: (gtin) => api.get<DadosProdutoExternoDTO | null>(\`/api/produtos/lookup?gtin=\${encodeURIComponent(gtin)}\`, { lookup: true }) })`. `onSuccess`: se `data` → `form.setValue('nome', data.nome, { shouldDirty: true })` + status "sugerido"; se `null` → status "não encontrado". `onError` (rede/500) → status "não encontrado" também (degradação uniforme; não propaga toast).

### 3. Nome continua editável e não obrigatório-por-lookup
`setValue` só preenche; a validação `zod` do nome (`min(1)`) continua a mesma. Se o lookup preencheu e o usuário apagar, o form exige o nome como sempre.

### 4. Sem lookup quando o campo está vazio
"Buscar" desabilitado se o código de barras está em branco. Nada de request com `gtin=`.

## Risks / Trade-offs

- **Shape de `DadosProdutoExternoDTO`** — confirmar no Swagger; se além de `nome` vier algo que o form usa (ex.: uma unidade sugerida), aproveitar; senão, só o nome.
- **Provedor externo lento/instável** (`spec.md` back §10.6: sem SLA) — a mutation pode demorar; mostrar "buscando…" e um timeout curto no `api-client`? O `api-client` não tem timeout hoje — aceitável pra um clique manual; se virar problema, adicionar `AbortController` (fora do escopo).
- **Depende de `dialogs-reutilizaveis`** — se aplicada antes, o form já está no modal e a reordenação é trivial; se não, reordena no form full-screen e o modal vem depois sem conflito.
