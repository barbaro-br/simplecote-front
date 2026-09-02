## 1. Sincronização reflete no cache

- [x] 1.1 Em `useFilaDeSincronizacao.ts`, capturar a resposta do `api.put<CotacaoPorToken>` e, no sucesso (versão ainda válida), atualizar o cache com `queryClient.setQueryData(cotacaoKey(token), data)`. Verificar: teste do hook (`useFilaDeSincronizacao.test.tsx`) verde.
- [x] 1.2 Remover o `useEnviarLance` órfão de `cotacao-token.api.ts` (e os imports de `useMutation`/`useQueryClient` que ficarem sem uso). Verificar: `npm run build` verde e `npm run lint` sem warning novo.

## 2. UI: feedback e destaque do unitário

- [x] 2.1 Em `ItemLanceCard.tsx`, exibir "calculando…" no campo de preço unitário quando `status === 'enviando'` e `precoUnitario` ainda for `null`. Verificar: teste do card (`ItemLanceCard.test.tsx`) cobre o estado "calculando…".
- [x] 2.2 Em `ItemLanceCard.tsx`, subir a hierarquia visual do unitário para `text-sm font-semibold text-foreground tabular-nums text-right` (tokens de tema, sem cor fixa). Verificar: `npm run lint` verde e inspeção do alinhamento.

## 3. Testes de regressão

- [x] 3.1 Em `useFilaDeSincronizacao.test.tsx`, adicionar caso: após `PUT /lances` com sucesso, o cache do React Query reflete o `precoUnitario` devolvido. Verificar: `npm test` verde.
- [x] 3.2 Em `ItemLanceCard.test.tsx`, adicionar caso: o unitário aparece após a sincronização e mostra "calculando…" durante o envio. Verificar: `npm test` verde.

## 4. Verificação final

- [x] 4.1 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar os três verdes (regra AGENTS.md §3).
