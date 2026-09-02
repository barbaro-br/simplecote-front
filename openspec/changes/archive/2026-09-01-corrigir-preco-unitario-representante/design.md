## Context

A tela do representante carrega a cotação via `useCotacaoPorToken` (`cotacao-token.api.ts`) e sincroniza lances pela `useFilaDeSincronizacao` (`useFilaDeSincronizacao.ts`). Hoje a fila faz o `PUT /lances` direto via `api.put` e **descarta a resposta** — o `precoUnitario` recalculado nunca chega ao cache do React Query, então o card do item segue mostrando "—" mesmo após o preço sincronizar. O `useEnviarLance` (que fazia o `setQueryData` certo) está órfão. Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- O `precoUnitario` recalculado refletir no card logo após a sincronização, sem refresh.
- Feedback "calculando…" durante o envio e destaque visual do unitário.

**Non-Goals:**
- **Não** recalcular `preco / quantidade` no front (regra §4 — o valor vem da API).
- Não mudar contrato de API, máquina de estados da fila, retry ou o `debounce`.

## Decisions

### D1 — A fila passa a atualizar o cache com a resposta do PUT
Em `useFilaDeSincronizacao.enviarUm`, capturar o retorno de `api.put<CotacaoPorToken>(...)` e, no sucesso (versão ainda válida), chamar `queryClient.setQueryData(cotacaoKey(token), data)`.
- A chave `cotacaoKey` já é exportada de `cotacao-token.api.ts`; o hook passa a importá-la. `useQueryClient` vem do mesmo TanStack Query.
- **Alternativa considerada:** reusar `useEnviarLance` — descartada: ele não cobre a versão/retry/status por célula da fila; a fila precisa da resposta *e* do próprio fluxo de erro.

### D2 — Remover o `useEnviarLance` órfão
`useEnviarLance` só é definido, nunca usado (grep: 1 ocorrência = a própria definição). Com D1, ele vira definitivamente morto e é removido junto com os imports que só ele usava (`useMutation`).

### D3 — "calculando…" deriva do estado da célula, sem novo estado local
Em `ItemLanceCard`, o unitário passa a ser:
```
item.precoUnitario != null
  ? 'unit. ' + moeda(item.precoUnitario)
  : (status === 'enviando' && temPreco ? 'calculando…' : '—')
```
Assim o "calculando…" só aparece na janela de `enviando` e quando ainda não há unitário; se o item já tinha unitário de um sync anterior, ele continua visível.

### D4 — Destaque visual sem cores fixas
O span do unitário sai de `text-[11px] text-muted-foreground` para `text-sm font-semibold text-foreground tabular-nums text-right` (largura fixa em `md`), usando tokens do tema. Sem cor crua.

## Risks / Trade-offs

- **[R1] Atualizar o cache pode re-renderizar a lista inteira** → o cache atualiza o DTO completo; como os cards já são leves e o `ItemLanceCard` guarda o texto digitado em estado local (não regride ao valor da API), o impacto é só o unitário/mensagem de status. Aceitável.
- **[R2] "calculando…" pode piscar entre teclas** → aparece apenas com `status === 'enviando'`, que só é setado após o debounce assentar; sem flicker de digitação.
- **[R3] Concorrência (edição rápida)** → já tratada pelo `versaoRef` existente: um resultado obsoleto não sobrescreve o cache nem o status.

## Migration Plan

- Sem migração de dados/API. Rollback: reverter o working tree; o comportamento volta ao "—" fixo (sem quebra funcional além do bug original).
