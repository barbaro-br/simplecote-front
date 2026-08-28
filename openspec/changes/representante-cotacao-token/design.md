## Context

Ver `proposal.md` — Why. Estado atual e restrições:

- `src/routes.tsx`: `/cotacao/:token` e `/pedido/:token` são `<div>` placeholder, fora da árvore `/admin` e sem `AuthGuard`/`AdminLayout`.
- `spec.md` §10.2 é **normativo** e detalha o fluxo passo a passo; §9.1 dá a máquina de estados da célula; §13 manda a tela do representante forçar tema claro; §7 nº 4 diz que ela "entra cedo de propósito".
- Backend público: `GET /public/cotacoes/{token}` → DTO com cotação + participante + itens + lances + `precoUnitario` + `podeEditar` + nomes; `PUT /public/cotacoes/{token}/lances` body `{ lances: [{ itemCotacaoId, preco?, naoCotado? }] }` (aceita lista; o front manda 1); `POST /public/cotacoes/{token}/finalizar` → 204. Pedido: `GET /public/pedidos/{token}`, `GET /public/pedidos/{token}.pdf`, `POST /public/pedidos/{token}/confirmar`.
- `api-client` só anexa `Authorization` quando há token em `sessionStorage` — as rotas `/public/**` não têm sessão, então não levam header. OK.
- `localStorage` disponível; `try/catch` em todo acesso (aba anônima, storage cheio).

## Goals / Non-Goals

**Goals:**
- Implementar §10.2 exatamente como especificado — a fila é a razão de ser desta tela.
- Feedback por célula, uma requisição por item.
- Sobreviver a fechar/reabrir o navegador com pendências.

**Non-Goals:**
- Service Worker / PWA / offline total (`spec.md` §15).
- Grade multi-participante (isso é do admin).
- Otimizações de render além de chave estável por `itemCotacaoId` (`spec.md` §14).
- Suportar edição em lote pela UI (a API aceita, o front não usa).

## Decisions

### 1. Estrutura de `src/representante/`
```
cotacao/
  CotacaoPorTokenPage.tsx     orquestra: header, lista de itens, botão finalizar
  cotacao-token.api.ts        useCotacaoPorToken(token), mutation de PUT lances (1 item), mutation finalizar
  cotacao-token.schema.ts     tipos do DTO público + zod do campo de preço
  fila-sincronizacao.ts       módulo puro: ler/gravar/remover entrada, chave por token, try/catch
  useFilaDeSincronizacao.ts   hook: estado da fila + timer 10s + listener 'online' + retry no mount
  ItemLanceCard.tsx           uma linha/card: campo de preço, toggle "não cotado", indicador (sincronizado/enviando/falhou)
pedido/
  PedidoPorTokenPage.tsx
  pedido-token.api.ts
shared/hooks/useDebounce.ts   (se ainda não existir)
```

### 2. Fila: fonte de verdade local + servidor como verdade final
`fila-sincronizacao.ts` expõe `lerFila(token)`, `gravarEntrada(token, itemId, patch)`, `removerEntrada(token, itemId)`, `limparFila(token)`. O componente nunca preenche um campo só com valor local sem antes ter tentado sincronizar (o valor inicial vem sempre do `GET`). O estado visual da célula (`sincronizado`/`enviando`/`falhou`) é derivado de: existe entrada na fila? qual foi o último resultado?

### 3. Debounce e disparo por item
`useDebounce(valor, 800)` por item, ou um debounce manual por `itemCotacaoId` dentro do hook da fila. Ao "assentar": `gravarEntrada` + disparar a mutation `PUT .../lances` com `{ lances: [aquele item] }`. `onSuccess` → `removerEntrada`. `onError` de rede → deixa a entrada, `tentativas++`. Distinguir erro de rede (fetch rejeita / `TypeError`) de `ApiError` 4xx: um 422 do backend (preço inválido) **não** vai para retry infinito — mostra o `ProblemDetail` e tira da fila (ou marca como erro definitivo). Só falha de transporte fica na fila.

### 4. Timer, `online`, mount
`useFilaDeSincronizacao` mantém um `setInterval(10_000)` ativo só enquanto `Object.keys(fila).length > 0`; `window.addEventListener('online', retryAgora)`; e no `useEffect` de mount, se a fila do token não está vazia, chama `retryAgora()` uma vez. `retryAgora` reenvia cada entrada em ordem de `ultimaTentativaEm`/inserção.

### 5. Finalizar
Botão desabilitado enquanto `filaNaoVazia`; label "Sincronizando {n} preço(s)…". `onClick` → `POST /finalizar`; `onSuccess` (204) → `limparFila(token)` + `invalidateQueries` do `GET` (a tela recarrega como `RESPONDIDO`).

### 6. Tema claro forçado
Wrapper da árvore `/representante` aplica a classe/atributo de tema claro independentemente da preferência do sistema (o painel admin segue o sistema; aqui é fixo, `spec.md` §13).

## Risks / Trade-offs

- **Shape exato do DTO público** (`GET /public/cotacoes/{token}`) — conferir no Swagger; nomes de campos (`representanteNome`, `empresaNome`, `compradorNome`, `podeEditar`, `precoUnitario`) vêm do backend `spec.md` §12.3, validar.
- **Distinguir erro de rede de 4xx** é a parte sutil: retry infinito de um 422 seria um bug. Cobrir com teste os dois caminhos.
- **`localStorage` indisponível** (aba anônima/quota) — `try/catch` em tudo; se não dá para persistir, a fila vive só em memória e o aviso de "pode perder ao fechar" fica implícito (fora de escopo um banner).
- **Testes de tempo** (debounce 800ms, timer 10s) — usar `vi.useFakeTimers()` no Vitest; `userEvent` com `advanceTimers`.
- **Concorrência**: representante edita o mesmo item duas vezes antes do primeiro PUT voltar — a segunda edição sobrescreve a entrada da fila e cancela/ignora o resultado obsoleto (comparar por um contador de versão por item).

## Open Questions

- `GET /public/cotacoes/{token}` continua acessível após o prazo (só leitura), conforme `spec.md` §10.3 do back? Assumindo que sim (a spec do back diz "leitura após o prazo continua permitida"); se não, a tela de "somente leitura" trata o 4xx como estado read-only. Não muda a arquitetura da fila.
