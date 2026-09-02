## Why

Na tela do representante (`/cotacao/:token`), o preço unitário — o dado central de um leilão reverso — não aparece quando o representante digita o preço da embalagem: a resposta do `PUT /public/cotacoes/{token}/lances` (que traz o `precoUnitario` recalculado pelo backend) é descartada pela fila de sincronização, então o cache nunca é atualizado e o campo fica em "—" até um refresh manual.

## What Changes

- **Corrigir a sincronização:** `useFilaDeSincronizacao` passa a capturar a resposta do `PUT /lances` e atualizar o cache do React Query (como o `useEnviarLance` já fazia e não era usado), fazendo o `precoUnitario` recalculado refletir na UI logo após a sincronização — sem recalcular nada no front (regra §4).
- **Feedback durante a sincronização:** enquanto o lance está `enviando`, o campo de preço unitário exibe "calculando…" em vez de ficar silencioso em "—".
- **Destaque do preço unitário:** subir a hierarquia visual do valor unitário (hoje `text-[11px]` apagado) para um tamanho legível, alinhado à direita, ao lado do campo de preço.
- **Remover código morto:** `useEnviarLance` (não usado) é reaproveitado/removido conforme a implementação.

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova. -->

### Modified Capabilities

- `representante/cotacao`: o preço unitário derivado (`precoUnitario`) SHALL refletir na tela assim que o lance é sincronizado, sem exigir refresh manual.

## Impact

- **Código:** `src/representante/cotacao/useFilaDeSincronizacao.ts` (capturar resposta + atualizar cache), `src/representante/cotacao/cotacao-token.api.ts` (expor/consumir `cotacaoKey`; remover `useEnviarLance` se órfão), `src/representante/cotacao/ItemLanceCard.tsx` (feedback "calculando…" + destaque do unitário).
- **Testes:** `useFilaDeSincronizacao` (cache atualizado após PUT) e `ItemLanceCard` (unitário aparece após sync; estado "calculando…" durante o envio).
- **Sem mudança** de contrato de API, regra de negócio ou dependências — o backend já devolve o `precoUnitario` recalculado na resposta do PUT.
