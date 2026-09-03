## Context

```tsx
{/* P.CX */}
<div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 transition-colors focus-within:border-muted-foreground">
  <span className="text-[11px] font-medium text-muted-foreground">R$</span>
  <input ... className="w-14 bg-transparent text-[12px] font-semibold tabular-nums outline-none ..." />
</div>

{/* P.UN */}
<div className="rounded-lg border border-border bg-card px-2 py-1">
  <span className={`whitespace-nowrap tabular-nums ${...}`}>{unitario}</span>
</div>
```
A caixa do P.CX tem largura efetivamente fixa via `w-14` no input (56px) +
"R$" + gap + padding. A caixa do P.UN não tem nenhuma largura mínima —
cresce e encolhe com o conteúdo (`—` é bem mais estreito que
`calculando…` ou `R$ 12,50`).

## Goals / Non-Goals

**Goals:**
- As duas caixas ficam visualmente com a mesma largura (ou bem próximas),
  em qualquer um dos três estados do P.UN (vazio "—", "calculando…", valor
  formatado).

**Non-Goals:**
- Não muda a lógica de cálculo do preço unitário, nem o texto/formatação
  exibida — só a largura da caixa.

## Decisions

- **`min-w-[72px]` (ajustável na verificação visual) + `text-center` na
  caixa do P.UN**, calibrado pra cobrir o texto mais longo esperado
  ("calculando…") sem ficar largo demais quando o conteúdo é curto ("—").
  O valor exato do `min-w` deve ser ajustado durante a verificação visual
  (tarefa dedicada abaixo) comparando lado a lado com a largura real
  renderizada da caixa do P.CX no navegador, em vez de fixar um número às
  cegas.

## Risks / Trade-offs

- Nenhum — é ajuste puramente visual, sem mudança de comportamento.
