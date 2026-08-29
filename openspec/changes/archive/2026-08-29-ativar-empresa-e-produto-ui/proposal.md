## Why

Na tabela de Empresas (e de Produtos), o Comprador consegue **inativar** mas não **reativar** — e nem enxerga os inativos, porque a listagem só traz ativos. Um item inativado some e não tem volta pela UI. Além disso, as ações são botões de texto que ocupam espaço e não dizem qual linha está sob o mouse.

## What Changes

- **Consumir os endpoints novos** de `reativar-empresa-e-produto` (`simplecote-back`): `POST /api/empresas/{id}/ativar`, `POST /api/produtos/{id}/ativar`, e `GET ...?incluirInativos=true`.
- **Listagem com inativos**: as telas de Empresas e Produtos passam a listar ativos **e** inativos (`incluirInativos=true`). Linha inativa fica **visualmente apagada** (cinza, texto suave).
- **Ação por estado**: linha ativa → ação "Inativar"; linha inativa → ação "Ativar". Uma só coluna de ação que muda conforme o `ativo`.
- **Ações como ícones + tooltip**: trocar os botões de texto por ícones (`lucide-react`), com **tooltip no hover** ("Inativar" / "Ativar" / "Editar") e **destaque da linha inteira** ao passar o mouse (fica claro qual linha vai ser afetada).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `admin/empresas`: "Inativação e Reativação de Empresa" ganha o cenário de reativação, a listagem com inativos e a UX de ícone+tooltip+hover-na-linha.
- `admin/produtos`: "Inativação de Produto" vira "Inativação e Reativação de Produto" com os mesmos cenários.

## Impact

- `src/admin/empresas/empresas.api.ts` + `EmpresasPage.tsx`, `src/admin/produtos/produtos.api.ts` + `ProdutosPage.tsx` (`useAtivarEmpresa`/`useAtivarProduto`, `incluirInativos` na query, coluna de ação por estado, ícones + tooltip + hover na linha).
- Novo `src/shared/components/ui/tooltip.tsx` (ou usar `title` nativo se preferir simplicidade — decidir no design).
- Testes: linha inativa mostra "Ativar"; clicar ativa e a linha "acende"; hover destaca a linha; tooltip aparece.
- **Depende de** `reativar-empresa-e-produto` (back) estar aplicada. Coordena visualmente com `shell-e-tema` (paleta/hover), mas não bloqueia.
