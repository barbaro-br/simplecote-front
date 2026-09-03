## Why

O back (`permitir-adicionar-item-cotacao-aberta`, `simplecote-back`) passa a aceitar adicionar item numa Cotação `ABERTA`, com notificação automática e reabertura de participantes que já haviam finalizado. Falta o front: um jeito de o Comprador adicionar o item enquanto a grade ao vivo está em tela (hoje `ItensSection`, que tem esse formulário, só aparece em `RASCUNHO`), e um indicador visual pro representante notar que apareceu um item novo desde a última vez que ele mexeu na cotação.

## What Changes

- Botão "Adicionar item" reaproveitando o `AdicionarItemModal` já existente, visível ao lado da grade ao vivo quando a Cotação está `ABERTA` (hoje esse modal só é alcançável via `ItensSection`, que não renderiza em `ABERTA`).
- Tela do representante (`ItemLanceCard.tsx`): badge "Novo" num item cujo lance está `PENDENTE` enquanto outros itens da mesma cotação já têm lance `COTADO`/`NAO_COTADO` — sinal de que esse item apareceu depois da primeira rodada de resposta, sem precisar de nenhum dado novo do backend.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: novo requirement — adicionar item com a Cotação `ABERTA`, a partir da tela de detalhe.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx` (ou `GradeAoVivoContainer`, mesmo arquivo) — botão "Adicionar item" + `AdicionarItemModal` quando `status === 'ABERTA'`.
- `src/representante/cotacao/cotacao-token.derivados.ts` — nova função pura `itemEhNovo(item, todosItens)`.
- `src/representante/cotacao/CotacaoPorTokenPage.tsx` — calcula a flag por item e repassa pro card.
- `src/representante/cotacao/ItemLanceCard.tsx` — badge "Novo" quando a flag é verdadeira.
- **Depende do backend** (`permitir-adicionar-item-cotacao-aberta`) pro botão "Adicionar item" funcionar de fato quando `ABERTA`; o badge "Novo" no representante não depende de nenhum campo novo do backend (é inferido só da combinação de status de lance já existente).
