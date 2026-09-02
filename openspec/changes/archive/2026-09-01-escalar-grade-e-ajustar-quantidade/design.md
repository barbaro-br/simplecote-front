## Context

A `GradeAoVivoTabela` já tem a coluna do item `sticky left-0`. O endpoint `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade` e o hook `useAtualizarQuantidadeItem` já existem no front; o que bloqueia o ajuste de quantidade fora de `RASCUNHO` é a regra em `Cotacao.alterarQuantidadeItem` (back). Esta change cobre front e back. Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Grade densa (cabeçalho fixo + tipografia) e ajuste de quantidade na grade.
- Permitir alterar quantidade em `ABERTA`/`ENCERRADA` (antes da apuração).

**Non-Goals:**
- Não altera quantidade em `PEDIDOS_GERADOS`/`CANCELADA`.
- Não recalcula preço/vencedor no front.

## Decisions

### D1 — Sticky aplicado nas células, não no `<thead>`
Cada `<th>` ganha `sticky top-0` com fundo opaco; o canto ganha `sticky top-0 left-0`. Matriz de z-index: células `z-1`, coluna do item `z-10`, cabeçalho `z-20`, canto `z-30`.

### D2 — Tipografia da coluna do item
Nome do item para `font-normal`/`font-medium`, reduzindo a hierarquia frente aos preços/status.

### D3 — Relaxar a regra no backend (cross-repo)
`Cotacao.alterarQuantidadeItem` deixa de exigir `RASCUNHO` e passa a **bloquear** apenas `PEDIDOS_GERADOS` e `CANCELADA`:
```java
if (status == StatusCotacao.PEDIDOS_GERADOS || status == StatusCotacao.CANCELADA) {
    throw new RegraDeNegocioException("Só é possível alterar a quantidade antes da apuração.");
}
```
A quantidade não afeta o preço unitário (`preco ÷ quantidadePorEmbalagem`), então a comparação de vencedor permanece válida.

### D4 — Edição de quantidade na grade (front)
Na coluna do item (ou adjacente), exibir a `quantidadeSolicitada` e permitir edição inline quando a Cotação está `ABERTA`/`ENCERRADA`, reutilizando `useAtualizarQuantidadeItem`. A grade reflete a nova quantidade após o `PATCH`.

## Risks / Trade-offs

- **[R1] `overflow-x-auto` força `overflow-y: auto`** → pode quebrar o `sticky top-0`; validar no navegador e ajustar o container de scroll se preciso.
- **[R2] Regra de quantidade é domínio do back** → a mudança no back precisa de teste atualizado (o teste atual deve afirmar o bloqueio em `RASCUNHO`).
- **[R3] Mudança de quantidade durante `ABERTA` reflete no representante** → o representante vê `quantidadeSolicitada` no próximo fetch; comportamento aceito (o Comprador é quem decide o volume).

## Migration Plan

- Sem migração de dados. Rollback: reverter o working tree dos dois repos; a regra volta a `RASCUNHO`-only.
