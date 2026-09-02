## Why

Dois problemas na mesma superfície (a grade ao vivo da cotação): (1) com centenas de itens e 10+ Empresas, o cabeçalho das Empresas some ao rolar e o nome do item pesa demais; (2) o Comprador não consegue ajustar a quantidade que vai comprar quando acha um preço muito bom durante/depois da cotação — a regra atual do backend só permite mudar quantidade em `RASCUNHO`. Esta change resolve os dois, no front e no back, em conjunto.

## What Changes

- **Front — grade densa**: cabeçalho fixo no topo (`sticky top-0`, fundo opaco), matriz de z-index (células `z-1`, coluna do item `z-10`, cabeçalho `z-20`, canto `z-30`) e tipografia mais leve na coluna do item.
- **Back — relaxar a regra de quantidade**: `Cotacao.alterarQuantidadeItem` passa a permitir alterar a quantidade enquanto a cotação **não foi apurada nem cancelada** (`RASCUNHO`, `ABERTA`, `ENCERRADA`), bloqueando apenas em `PEDIDOS_GERADOS` e `CANCELADA`. **BREAKING** em relação à regra atual (que restringe a `RASCUNHO`).
- **Front — editar quantidade na grade**: a grade passa a exibir e permitir editar a `quantidadeSolicitada` de cada item enquanto a cotação está `ABERTA` ou `ENCERRADA`, usando o `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade` já existente.

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova. -->

### Modified Capabilities

- `admin/cotacoes`: a grade ganha cabeçalho fixo, tipografia leve e edição inline da quantidade do item.

## Impact

- **Back (`simplecote-back`):** `src/main/java/com/simplecote/cotacao/Cotacao.java` (relaxar `alterarQuantidadeItem`) + testes (`CotacaoTest`/`CotacaoServiceTest`).
- **Front:** `src/admin/cotacoes/GradeAoVivoTabela.tsx` (sticky + z-index + tipografia + edição de quantidade), possivelmente `UltimaCompraPopover.tsx` e `cotacoes.api.ts` (o hook `useAtualizarQuantidadeItem` já existe).
- **Sem novo endpoint** — o `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade` já existe; a mudança é a regra de negócio do backend.

## Non-Goals

- Não permite alterar quantidade após a apuração (`PEDIDOS_GERADOS`) ou em `CANCELADA`.
- Não recalcula preço unitário/vencedor no front (a quantidade não afeta a comparação de preço unitário).
