## Why

Na tela de Resultado (`ResultadoPage`), os itens sem vencedor aparecem numa lista, sem ação. Pra recolocá-los numa nova rodada, o admin hoje cria uma cotação do zero e re-adiciona os produtos. A change de mesmo nome no `simplecote-back` adiciona `POST /api/cotacoes/{id}/recotar-sem-vencedor`.

## What Changes

- Na `ResultadoPage`, quando há itens sem vencedor, um botão **"Recotar itens sem vencedor"**.
- Clique → confirmação curta → `POST /api/cotacoes/{id}/recotar-sem-vencedor` → navega para a nova cotação (`RASCUNHO`) criada.
- Se a API retornar itens omitidos (produto inativado), mostrar um toast/aviso listando-os (mesma UX de "duplicar cotação").
- O botão só aparece quando `itensSemVencedor.length > 0`.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a tela de Resultado da apuração passa a oferecer a ação de recotar os itens que ficaram sem vencedor, criando um novo rascunho só com eles.

## Impact

- `cotacoes.api.ts`: `useRecotarSemVencedor(cotacaoId)` — `api.post<CotacaoDuplicadaResponse>('/api/cotacoes/' + id + '/recotar-sem-vencedor')`; `onSuccess` invalida `['cotacoes']`.
- `ResultadoPage.tsx`: botão "Recotar itens sem vencedor" quando `resultado.itensSemVencedor.length > 0` → `ConfirmarDialog` → hook → `navigate('/admin/cotacoes/' + nova.id)`; omitidos → toast.
- `cotacoes.schema.ts`: reusar `CotacaoDuplicadaResponse`/`ItemOmitido` já existentes (de `duplicar`).
- Testes: `ResultadoPage.test.tsx` — botão só com itens sem vencedor; confirmar chama o endpoint e navega para a nova cotação; omitidos viram aviso; erro via `ApiError.message`.
- Sem dependência nova. Depende da change do `simplecote-back` mesclada.
