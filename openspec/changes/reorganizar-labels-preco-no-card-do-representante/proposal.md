## Why

Achado ao testar ao vivo (dados reais): o texto "unidade. R$ 0,34" (rótulo + preço unitário calculado) estoura seu container de largura fixa (96px, mas o texto renderizado precisa de 112px) e visualmente sobrepõe o ícone de status (✓/✗) ao lado — confirmado via `scrollWidth` (112px) > `clientWidth` (96px) no elemento real. É um problema de layout horizontal apertado: rótulo e valor competem pelo mesmo espaço lateral, junto do campo de preço da embalagem e do ícone de status, tudo numa linha só.

Pesquisa de UX (Baymard, UX Planet, UXmatters): label acima do campo (empilhado) tem melhor tempo de leitura que label ao lado (inline), e em mobile especificamente libera a largura horizontal em vez de competir por espaço — resolve o overflow na raiz, não só sintomaticamente. Confirmado também que a hierarquia visual atual (preço da embalagem editável com mais peso; preço unitário calculado como texto simples, nunca como input) já está certa (convenção de etiqueta de preço unitário — o preço que se paga precisa ter peso igual ou maior que o unitário, que é só referência).

## What Changes

- `ItemLanceCard.tsx`: os rótulos "unidade." (preço unitário) e o campo de preço da embalagem ganham rótulos curtos **empilhados acima do valor**, não mais ao lado: "P.CX" acima do input de preço da embalagem (editável), "P.UN" acima do preço unitário calculado (texto simples, só leitura). Empilhar verticalmente resolve o overflow horizontal — cada bloco passa a ser uma coluna estreita e alta, não uma linha larga.
- Tutorial de primeira visita: reforça brevemente o que "P.CX"/"P.UN" significam, já que são abreviações novas.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: o requirement de visualização por token é ajustado pra descrever a nova estrutura do card (rótulos empilhados, abreviados).

## Impact

- `src/representante/cotacao/ItemLanceCard.tsx` — reestruturação do bloco de preço (rótulos empilhados).
- `src/representante/cotacao/TutorialOnboarding.tsx` — reforço textual das abreviações.
- Nenhuma mudança de backend — é reorganização visual de dados já retornados pela API.
