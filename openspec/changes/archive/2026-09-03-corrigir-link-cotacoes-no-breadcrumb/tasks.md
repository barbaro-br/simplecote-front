## 1. Corrigir os links

- [x] 1.1 Em `src/admin/cotacoes/CotacaoDetalhePage.tsx`: trocar `{ label: 'Cotações', to: '/admin' }` por `{ label: 'Cotações', to: '/admin/cotacoes' }`.
- [x] 1.2 Em `src/admin/cotacoes/ResultadoPage.tsx`: mesma correção.

## 2. Testes

- [x] 2.1 Ajustar os testes existentes que checam o `href` do link "Cotações" no breadcrumb (se algum já afirma `/admin`, corrigir a expectativa pra `/admin/cotacoes`).
- [x] 2.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
