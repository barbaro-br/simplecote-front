## 1. Tema

- [x] 1.1 Em `src/index.css`, alinhar os tokens à `spec.md` §13: `--primary` `oklch(0.42 0.09 155)` + `--primary-foreground`; `--background`/`--card` neutro quente (claro e dark); adicionar `--success` (verde claro) e `--warning` (âmbar) em `:root` e no bloco dark. Verificar: `npm run build` ok; passar o olho em Login/Produtos/Empresas/Cotações — nada ilegível.

## 2. StatusBadge

- [x] 2.1 Criar `src/shared/components/StatusBadge.tsx` — `Record<StatusCotacao, {label, cls}>` exaustivo, `<span>` com `bg-*/10 text-*`. Verificar: teste renderiza cada um dos 5 status com o label certo.
- [x] 2.2 Usar `StatusBadge` na coluna de status de `CotacoesPage` e no cabeçalho de `CotacaoDetalhePage`. Verificar: os testes dessas telas continuam verdes (asserção por texto do status segue valendo).

## 3. Sidebar

- [x] 3.1 `AdminLayout.tsx`: itens viram `NavLink` com ícone `lucide-react` (`LayoutDashboard`/`Package`/`Building2`/`FileText`) + rótulo; ativo destacado via `isActive` (`aria-current="page"`); hover com `transition-colors`. Verificar: teste — navegar pra `/admin/produtos` marca o item Produtos como ativo.
- [x] 3.2 Botão sanduíche que alterna `colapsada` (estado em `AdminLayout`, init de `localStorage['simplecote:sidebar']` com `try/catch`, `useEffect` persiste). Colapsada: `w-16`, só ícone, rótulo no `title`. `transition-[width]`. Verificar: teste — clicar no sanduíche colapsa; remontar o componente mantém colapsada (localStorage semeado).

## 4. Polish de tabela

- [x] 4.1 Aplicar hover/transição consistente (`hover:bg-muted/40 transition-colors`, header `bg-muted/50`) em `CotacoesPage`, `ProdutosPage`, `EmpresasPage`. Verificar: `npm run build` ok; testes verdes.

## 5. Fechamento

- [x] 5.1 `npx vitest run` verde (novos testes de `AdminLayout` e `StatusBadge`), `npx tsc -b` 0, `npm run build` completa.
- [x] 5.2 `openspec validate shell-e-tema` sem erros.
