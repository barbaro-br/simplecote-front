## 1. Tipos e hook

- [x] 1.1 `cotacoes.schema.ts`: tipos `GradeAoVivo` (`status`, `respondidos`, `totalParticipantes`, `itens: ItemGrade[]`), `ItemGrade` (`itemCotacaoId`, `nome`, `unidade`, `quantidadePorEmbalagem`, `quantidadeSolicitada`, `ultimoPrecoUnitario`, `ultimaCompraEmpresa`, `ultimaCompraEm`, `menorPrecoUnitario`, `precos: CelulaGrade[]`), `CelulaGrade` (`participanteId`, `empresaId`, `empresa`, `preco`, `precoUnitario`, `status`). Conferir shapes no Swagger. Verificar: `npx tsc -b` 0.
- [x] 1.2 `cotacoes.api.ts`: `useGradeAoVivo(id)` — `useQuery` com `refetchInterval: (q) => q.state.data?.status === 'ABERTA' ? 5000 : false`, `queryKey ['cotacao', id, 'ao-vivo']`. Verificar: compila.

## 2. Tela da grade

- [x] 2.1 `GradeAoVivoPage.tsx` (`/admin/cotacoes/:id/ao-vivo`) + rota em `routes.tsx` + botão "Acompanhar ao vivo" no `CotacaoDetalhePage` (quando `ABERTA`/`ENCERRADA`). Cabeçalho "respondidos / total". Verificar: teste — abre a rota, mostra o cabeçalho.
- [x] 2.2 `GradeAoVivoTabela.tsx` — linhas por `itemCotacaoId` (`key` estável, `LinhaItem` em `React.memo`), colunas por Empresa; cada célula com status/preço/preço unitário; `menorPrecoUnitario` do item destacado. Verificar: teste MSW — grade com lances parciais renderiza `COTADO`/`NAO_COTADO`/`PENDENTE` e o menor preço destacado.
- [x] 2.3 Polling: teste com fake timers — `status: ABERTA` → refetch após 5s; MSW muda pra `status: ENCERRADA` → sem novos refetches; (jsdom não tem foco real, ok pular a pausa-por-foco no teste).

## 3. Última compra no hover

- [x] 3.1 `UltimaCompraPopover.tsx` — trigger no `<td>` do nome do item, `mouseenter` (com delay curto) → `<div>` posicionado com `moeda(ultimoPrecoUnitario)` · `ultimaCompraEmpresa` · `dataHoraBr(ultimaCompraEm)` + seta ▲/▼ comparando com `menorPrecoUnitario`. `ultimaCompraEm == null` → "sem compra anterior". Verificar: teste — hover num item com dado mostra preço+empresa+data; hover num item sem dado mostra "sem compra anterior".

## 4. Correção pela célula

- [x] 4.1 Clicar numa célula (`participanteId`) abre o `<Dialog>` de correção de lance (`useCorrigirLance`); `onSuccess` invalida `['cotacao', id, 'ao-vivo']`. Verificar: teste MSW — corrigir um lance pela célula reflete o novo valor na grade sem esperar o poll.

## 5. Fechamento

- [x] 5.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [x] 5.2 `openspec validate grade-ao-vivo-com-ultima-compra` sem erros.
