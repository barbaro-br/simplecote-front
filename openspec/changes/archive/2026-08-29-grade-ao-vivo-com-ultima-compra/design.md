## Context

Ver `proposal.md`. Estado:

- `GET /api/cotacoes/{id}/ao-vivo` → `GridAoVivoDTO { status, respondidos, totalParticipantes, itens: ItemGrid[] }`. `ItemGrid { itemCotacaoId, nome, unidade, quantidadePorEmbalagem, quantidadeSolicitada, ultimoPrecoUnitario, menorPrecoUnitario, precos: Celula[] }`. `Celula { participanteId, empresaId, empresa, preco, precoUnitario, status }`. Com `ultima-compra-por-produto` (back): `ItemGrid` ganha `ultimaCompraEmpresa`, `ultimaCompraEm`.
- Front: `CotacaoDetalhePage` existe; `cotacoes.api.ts` tem os hooks do ciclo; `useCorrigirLance` veio de `admin-cotacoes-participantes-respostas`. Não há tela de grade.
- `spec.md` §10.1: `refetchInterval: 5000` enquanto `ABERTA`, `false` senão; `refetchIntervalInBackground: false` (default). §14: não re-renderizar linhas que não mudaram (chave estável por `itemCotacaoId`).
- `formatters.ts` já tem `moeda` e `dataHoraBr`.

## Goals / Non-Goals

**Goals:**
- Tela de grade legível e que atualiza sozinha só quando faz sentido.
- Última compra acessível no hover, com comparação leve.
- Corrigir lance sem sair da grade.

**Non-Goals:**
- SSE (o back registra como evolução futura; o front só troca a camada de busca depois).
- Grade editável célula-a-célula inline (a correção passa pelo modal).
- Histórico/série de preços (só a última compra).
- Mobile (grade densa é desktop, `spec.md` §14).

## Decisions

### 1. `useGradeAoVivo(id, { ativo })` — polling condicional
```ts
useQuery({
  queryKey: ['cotacao', id, 'ao-vivo'],
  queryFn: () => api.get<GradeAoVivo>(`/api/cotacoes/${id}/ao-vivo`),
  refetchInterval: (q) => q.state.data?.status === 'ABERTA' ? 5000 : false,
})
```
O `refetchInterval` como função lê o último dado → liga/desliga sozinho quando o `status` muda numa resposta. `refetchIntervalInBackground` fica no default `false`.

### 2. Tabela: chave estável, memo por linha
`GradeAoVivoTabela` → `<tbody>` com uma `LinhaItem` por `item.itemCotacaoId` (`key` estável). `LinhaItem` em `React.memo` comparando o `item` por referência — o TanStack Query só recria os itens que mudaram? Não garante; então comparar shallow os campos que a linha usa. `spec.md` §14.

### 3. Popover de última compra: hover no nome do item
`UltimaCompraPopover` — trigger no `<td>` do nome do item; on `mouseenter` (com pequeno delay) mostra um `<div>` posicionado (absolute, dentro de um wrapper `relative`). Conteúdo: `moeda(ultimoPrecoUnitario)` · `ultimaCompraEmpresa` · `dataHoraBr(ultimaCompraEm)`; seta ▲/▼ comparando `menorPrecoUnitario` do item com `ultimoPrecoUnitario`. Se `ultimaCompraEm == null` → "sem compra anterior". Sem lib de popover (posição simples abaixo/à direita; se cortar na borda, ajuste depois).

- Alternativa (Radix/base-ui Popover): dependência; um `div` posicionado resolve pra um tooltip de leitura.

### 4. Correção pela célula reusa o fluxo existente
Clicar numa `Celula` (que tem `participanteId`) abre o `<Dialog>` de correção de lance com `useCorrigirLance({ participanteId, itemCotacaoId, ... })`. `onSuccess` invalida `['cotacao', id, 'ao-vivo']` → a grade atualiza na hora, sem esperar o poll.

### 5. Rota e navegação
`src/routes.tsx`: `cotacoes/:id/ao-vivo` → `<GradeAoVivoPage/>`. `CotacaoDetalhePage`: botão "Acompanhar ao vivo" visível quando `ABERTA` ou `ENCERRADA` (o back serve nos dois; §"É prévia").

## Risks / Trade-offs

- **Polling que não desliga** se o `status` nunca chega `!= ABERTA` na resposta (ex.: erro) → o `refetchInterval` função trata `undefined` como `false` (sem dado = não faz poll). Cobrir: teste com `status: ENCERRADA` → sem novos fetches.
- **Re-render da grade inteira a cada poll** — mitigar com `memo` por linha + `key` estável; medir se a grade for grande. Não otimizar demais antes de ter volume.
- **Popover posicionado à mão** corta em telas pequenas / última linha — aceitável pra v1; anotar como melhorável.
- **Depende do back** (`ultima-compra-por-produto`) pros campos `ultimaCompra*`; se aplicado antes, os campos vêm `undefined` → o popover cai no "sem compra anterior" sem quebrar. Não-bloqueante, mas a feature só fica completa com o par.
- **`useCorrigirLance`** vem de outra change já arquivada — confirmar que o hook existe em `cotacoes.api.ts` no momento do apply.
