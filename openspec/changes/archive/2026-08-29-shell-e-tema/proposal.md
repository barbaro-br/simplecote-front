## Why

O painel funciona mas está cru visualmente: o menu lateral é uma lista de links pequenos sem ícone, não colapsa, e as tabelas não dão feedback de hover. A `spec.md` §13 define uma paleta (verde profundo, neutros quentes, `success`/`warning` pra estados) que nunca foi aplicada além dos tokens default do shadcn. Pra mostrar pro cliente, o shell precisa parecer um produto.

## What Changes

- **Sidebar (`AdminLayout`)**: itens viram botões maiores com ícone (`lucide-react`, já é dependência) + rótulo; estado ativo destacado pela rota atual; hover com transição. Botão sanduíche (hambúrguer) que colapsa a sidebar para só-ícones e **lembra o estado** em `localStorage` (com `try/catch`).
- **Tema (`src/index.css`)**: aplicar a paleta da `spec.md` §13 nos tokens — `--primary` verde profundo `oklch(0.42 0.09 155)`, `--background`/`--card` neutro quente, `--success`/`--warning`/`--muted-foreground` pros estados. Manter claro/escuro (painel segue o sistema).
- **Badges de status**: `StatusBadge` reutilizável (Cotação: `RASCUNHO`/`ABERTA`/`ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA` com cor por estado) usado na lista de cotações e no detalhe.
- **Polish de tabela**: linha com hover (`hover:bg-muted/40`), transições, cabeçalho `bg-muted/50`, aplicado consistentemente em Produtos, Empresas e Cotações.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Polish visual e uma conveniência de UI (colapso persistido) — sem comportamento de domínio novo, sem mudança de rota, endpoint ou payload. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- `src/admin/layout/AdminLayout.tsx` (sidebar colapsável + ícones), novo `src/shared/hooks/useSidebarColapsada.ts` (ou estado local + `localStorage`).
- `src/index.css` (tokens de tema §13).
- Novo `src/shared/components/StatusBadge.tsx`; uso em `CotacoesPage`, `CotacaoDetalhePage`.
- Classes de hover/transição em `CotacoesPage`, `ProdutosPage`, `EmpresasPage`.
- Testes: um teste de `AdminLayout` (colapsa, persiste, rota ativa destacada) e de `StatusBadge`.
