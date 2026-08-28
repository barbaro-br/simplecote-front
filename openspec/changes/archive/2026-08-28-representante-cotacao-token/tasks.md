## 1. Fundação

- [x] 1.1 `src/shared/hooks/useDebounce.ts` (se ainda não existir) — `useDebounce<T>(value: T, ms: number): T`. Verificar: teste com `vi.useFakeTimers()` — o valor só muda após `ms`.
- [x] 1.2 `src/representante/cotacao/cotacao-token.schema.ts` — tipos do DTO de `GET /public/cotacoes/{token}` (conferir shape no `/swagger-ui.html`: cotação, participante, itens, lance, `precoUnitario`, `podeEditar`, `representanteNome`/`empresaNome`/`compradorNome`) + zod do campo de preço (`>= 0`). Verificar: `npx tsc -b` verde.
- [x] 1.3 `src/representante/cotacao/fila-sincronizacao.ts` — módulo puro: `lerFila(token)`, `gravarEntrada(token, itemId, patch)`, `removerEntrada(token, itemId)`, `limparFila(token)`, tudo em `localStorage` sob `simplecote:fila:{token}` com `try/catch`. Verificar: teste unitário — gravar/ler/remover/limpar; acesso que lança (mock de `localStorage` quebrado) não propaga exceção.

## 2. Leitura e layout da tela

- [x] 2.1 `src/routes.tsx`: `/cotacao/:token` → `<CotacaoPorTokenPage />`, `/pedido/:token` → `<PedidoPorTokenPage />` (substituir os `<div>`), fora de `/admin`, com um wrapper que **força tema claro** (`spec.md` §13). Verificar: rota renderiza a página; a árvore recebe o atributo/classe de tema claro mesmo com `prefers-color-scheme: dark`.
- [x] 2.2 `cotacao-token.api.ts` — `useCotacaoPorToken(token)` (`GET /public/cotacoes/{token}`), `useEnviarLance(token)` (`PUT /public/cotacoes/{token}/lances` com `{ lances: [umItem] }`), `useFinalizar(token)` (`POST /public/cotacoes/{token}/finalizar`). Verificar: compila; nenhum path `/public/...` fora deste arquivo.
- [x] 2.3 `CotacaoPorTokenPage.tsx` — cabeçalho com saudação (`representanteNome`) + `empresaNome`/`compradorNome`, lista de `ItemLanceCard`, botão finalizar. Estado "link inválido" para token inexistente; modo somente-leitura quando `podeEditar` é falso. Verificar: teste MSW — render com token válido mostra saudação e itens; `podeEditar:false` desabilita campos e esconde o finalizar; token inválido mostra o estado de erro.

## 3. Autosave + fila

- [x] 3.1 `useFilaDeSincronizacao(token)` — estado da fila (de `fila-sincronizacao.ts`), `setInterval(10s)` ativo só com fila não-vazia, listener `window 'online'` → retry imediato, retry imediato no mount se a fila não está vazia. `retryAgora()` reenvia cada entrada na ordem. Verificar: teste com fake timers — fila com 2 entradas, avançar 10s → 2 PUTs na ordem; disparar evento `online` → retry na hora.
- [x] 3.2 `ItemLanceCard.tsx` — campo de preço + toggle "não cotado"; `useDebounce(valor, 800)`; ao assentar: `gravarEntrada` + `useEnviarLance`. `onSuccess` → `removerEntrada`, célula `sincronizado`. Erro de **rede** → mantém entrada, `tentativas++`, célula `falhou`. Erro **`ApiError` 4xx** (ex.: 422 preço inválido) → tira da fila, mostra o `ProblemDetail`, célula em erro definitivo (sem retry). Indicadores visuais distintos para `enviando`/`sincronizado`/`falhou`. Verificar: teste MSW + fake timers — digitar preço → após 800ms 1 PUT só com aquele item → célula sincronizada; MSW respondendo erro de rede → entrada persiste no `localStorage` e célula "falhou"; MSW respondendo 422 → mensagem exibida, entrada some da fila.
- [x] 3.3 Concorrência: editar o mesmo item duas vezes antes do 1º PUT voltar → a 2ª edição sobrescreve a entrada e o resultado obsoleto é ignorado (contador de versão por item). Verificar: teste — dois `type` rápidos no mesmo campo geram no fim um estado consistente com o último valor.

## 4. Finalizar + pedido

- [x] 4.1 Botão "Finalizar resposta": desabilitado com "Sincronizando {n} preço(s)…" enquanto a fila do token não está vazia; ao finalizar com sucesso (204) → `limparFila(token)` + `invalidateQueries`, tela reflete `RESPONDIDO`. Verificar: teste MSW — fila com pendência → botão desabilitado com contagem; fila vazia + 204 → `simplecote:fila:{token}` removida do `localStorage`.
- [x] 4.2 `PedidoPorTokenPage.tsx` + `pedido-token.api.ts` — `GET /public/pedidos/{token}`, baixar PDF (`GET /public/pedidos/{token}.pdf`), `POST /public/pedidos/{token}/confirmar`. Mobile-first, sem navegação. Verificar: teste MSW — render mostra o pedido; "Confirmar" chama a API e reflete confirmado; erro `ProblemDetail` é exibido.

## 5. Fechamento

- [x] 5.1 `npx vitest run` verde (novos testes, incluindo os de fila/timer), `npx tsc -b` 0, `npm run build` completa.
- [x] 5.2 Verificado contra o backend vivo (`:8080`) o fluxo completo do token: `GET /public/cotacoes/{token}` → shape bate exatamente com `CotacaoPorToken` (`representanteNome`/`empresaNome`/`compradorNome`/`podeEditar`/`participanteStatus`/`itens[].precoUnitario`/`statusLance`); `PUT /public/cotacoes/{token}/lances` com `{lances:[{itemCotacaoId,preco}]}` → `200` + item `COTADO`; com `{naoCotado:true}` → `NAO_COTADO`; preço negativo → `400` (Bean Validation — **não 422**; o front já bloqueia local via `precoSchema.min(0)` e trata qualquer `ApiError` 4xx como erro definitivo, então o path é o mesmo); `POST /finalizar` → `204`; após `encerrar`+`apurar`, `GET /public/pedidos/{token}` → shape bate com `PedidoPorToken`, `GET /public/pedidos/{token}.pdf` → `200 application/pdf`. **Sem divergência de contrato.** (Simulação de offline/retry coberta pelos testes MSW com `HttpResponse.error()` + evento `online`.)
- [x] 5.3 `openspec validate representante-cotacao-token` sem erros.
