## Why

Quando o `prazo` de uma cotação `ABERTA` passa, os representantes já não conseguem responder, mas a UI não diz nada — a cotação parece só "aberta", e o admin não sabe que precisa encerrar para poder apurar. A change de mesmo nome no `simplecote-back` adiciona o campo `prazoVencido` nas leituras.

## What Changes

- Na tela de detalhe da cotação (`CotacaoDetalhePage`) e na lista (`CotacoesPage`), quando `status === 'ABERTA' && prazoVencido`, mostrar um aviso claro: **"Prazo vencido — os representantes não podem mais responder. Encerre para apurar."**
- Na tela de detalhe, o aviso fica junto do cabeçalho/ações, com o botão "Encerrar" em destaque.
- Na lista, um selo/indicador na linha da cotação com prazo vencido.
- Sem mudança nas ações (Encerrar/Reabrir seguem iguais); é só sinalização.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a tela de detalhe e a lista passam a sinalizar quando uma cotação `ABERTA` está com o prazo vencido, orientando o admin a encerrar.

## Impact

- `cotacoes.schema.ts`: adicionar `prazoVencido: boolean` a `Cotacao` e ao item do resumo da lista.
- `CotacaoDetalhePage.tsx`: quando `cotacao.status === 'ABERTA' && cotacao.prazoVencido`, renderizar um `ErrorAlert`/banner de aviso acima do conteúdo, com o texto e o realce do botão "Encerrar".
- `CotacoesPage.tsx`: `StatusBadge` ou um selo extra "prazo vencido" na linha quando o resumo traz `prazoVencido`.
- Testes: `CotacaoDetalhePage.test.tsx` — banner aparece só com `ABERTA` + `prazoVencido`, some ao encerrar; `CotacoesPage.test.tsx` — selo na linha com `prazoVencido`.
- Sem dependência nova. Depende da change do `simplecote-back` mesclada (o front só exibe o campo).
