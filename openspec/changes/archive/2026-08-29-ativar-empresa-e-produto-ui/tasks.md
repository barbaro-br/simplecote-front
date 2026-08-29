## 1. Hooks de ativar + listar com inativos

- [x] 1.1 `empresas.api.ts`: `useAtivarEmpresa` (`POST /api/empresas/{id}/ativar`, invalida a query); `useEmpresas` passa `?incluirInativos=true` e usa `queryKey ['empresas', { incluirInativos: true }]` (deixar `['empresas']` pros consumidores que querem só ativas — mapear com `grep useEmpresas`). Idem `produtos.api.ts` (`useAtivarProduto`, `useProdutos`). Verificar: `npx tsc -b` 0; nenhum consumidor de "só ativas" (seletor de convite) quebrou.

## 2. IconButton

- [x] 2.1 Criar `src/shared/components/ui/icon-button.tsx` — `<button title aria-label disabled>` com ícone `lucide-react`, hover/focus visíveis. Verificar: teste — renderiza o `aria-label`, dispara `onClick`, fica `disabled` quando passado.

## 3. Telas

- [x] 3.1 `EmpresasPage`: listar todos (ativos + inativos); linha inativa `opacity-50 text-muted-foreground`; `<tr class="group">` + `group-hover:bg-muted/40`. Coluna de ação: `Inativar` (ícone) se `ativo`, `Ativar` (ícone) se inativo, + `Editar`. Verificar: teste MSW — MSW `GET */api/empresas` retorna 1 ativa + 1 inativa → a inativa aparece apagada com "Ativar"; clicar "Ativar" (MSW `POST */api/empresas/:id/ativar` → 204) → lista revalida e a linha "acende".
- [x] 3.2 `ProdutosPage`: mesmo tratamento (todos, inativo apagado, ação por estado, hover na linha, ícones). Verificar: teste MSW análogo — produto inativo mostra "Ativar", clicar reativa.

## 4. Fechamento

- [x] 4.1 `npx vitest run` verde (novos testes + os ajustados de empresas/produtos), `npx tsc -b` 0, `npm run build` completa.
- [x] 4.2 `openspec validate ativar-empresa-e-produto-ui` sem erros.
