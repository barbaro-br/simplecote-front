## Context

A grade ao vivo é o `GradeAoVivoTabela.tsx`. As colunas financeiras (uma por Empresa convidada) são células `<td>` com um `<button>` de largura total que hoje usa `text-left` e, para o preço padrão `COTADO`, `bg-transparent border-transparent`. O projeto usa Tailwind v4 com tokens semânticos (`--muted`, `--muted-foreground`, `--border`, `--card`, `--success`) e **tem dark mode** (variantes `.dark` em `src/index.css`). Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Polir a apresentação da grade sem alterar dados, status, regras ou o fluxo de correção de lance.
- Manter a grade coerente com o design system (tokens), inclusive em dark mode.

**Non-Goals:**
- Não tocar na linha de totais (item 5 do pedido) — valor derivado que exige o back.
- Não mudar a funcionalidade do seletor de quantidade (só o visual).

## Decisions

### D1 — Tokens semânticos no lugar das classes cinza cruas

O pedido sugere `bg-gray-100`/`bg-slate-50`, `text-gray-400`, `border-gray-200` e `bg-white`. Essas classes cruas **não se adaptam ao dark mode** do admin e destoam do design system. Mapeamento adotado:

- `bg-gray-100`/`bg-slate-50` → `bg-muted`
- `text-gray-400` → `text-muted-foreground`
- `border-gray-200` → `border` (token `--border`)
- `bg-white` → `bg-card`

- **Alternativa considerada:** usar as classes cinza literais pedidas. Descartada: quebraria o dark mode e a consistência visual.

### D2 — Alinhamento à direita nas colunas financeiras

Aplicar `text-right` no `<th>` de cada Empresa e alinhar à direita o conteúdo interno das células (rótulo de status e bloco de preço). A coluna fixa do item (nome + quantidade) permanece à esquerda, pois não é uma coluna financeira.

- **Alternativa considerada:** manter `text-left` alinhando título e preço perfeitamente. Descartada: o padrão-ouro financeiro (à direita) foi o escolhido pelo usuário.

### D3 — Badge de estado vazio

Para `PENDENTE` e `NAO_COTADO`, trocar o `<span>` solto por uma pílula: `rounded-full bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5`. O rótulo `COTADO` (que acompanha um preço) permanece como está.

### D4 — Seletor de quantidade mais leve

Reduzir os botões `[-]`/`[+]` de `size-6` para `size-5`, ícone `size-3`, borda `border` (token, mais suave que o `outline` atual) e gap/padding menores. A funcionalidade (incrementar/decrementar, disable em `quantidadeSolicitada <= 1` ou pendente) não muda.

### D5 — Cartão para o preço `COTADO` padrão

No botão de célula, o preço padrão `COTADO` (não-menor) passa de `bg-transparent border-transparent` para `bg-card border` mantendo `rounded-md`, ficando simétrico ao cartão do menor preço (`bg-success/5 border-success/20`).

## Risks / Trade-offs

- [Dark mode com classes cruas] → mitigado por D1 (tokens).
- [Alinhamento à direita conflitar com a coluna fixa do item] → a coluna do item segue à esquerda; só as colunas financeiras alinham à direita.
- [Alterar o `<button>` de célula quebrar o clique de "Corrigir lance"] → o botão continua de largura total; só muda fundo/borda/alinhamento interno.

## Migration Plan

- Sem migração de dados nem endpoint. Rollback: reverter o working tree (`git restore` de `GradeAoVivoTabela.tsx`/teste).
