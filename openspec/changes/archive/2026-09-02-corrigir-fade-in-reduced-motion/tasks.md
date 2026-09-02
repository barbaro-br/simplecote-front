## 1. Correção do fade-in

- [x] 1.1 Em `src/index.css`, trocar `.fade-in { animation: fadeIn 0.3s ease forwards; }` para `both`; verificar que o diff é só o `forwards` → `both`.
- [x] 1.2 Em `src/admin/cotacoes/CotacoesPage.tsx`, remover o `opacity-0` e o condicional `isTest` da `<tr>` (deixar `className="transition-colors hover:bg-muted/40 fade-in"` com o `animationDelay`); verificar que `npm run build` passa.

## 2. Teste de regressão

- [x] 2.1 Adicionar teste em `CotacoesPage.test.tsx` que renderize a lista e asserte que a linha da cotação não tem a classe `opacity-0`; verificar que `npm test` passa.

## 3. Verificação

- [x] 3.1 Rodar `npm test`, `npm run build` e `npm run lint` e confirmar os três verdes.
