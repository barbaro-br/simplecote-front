## 1. Implementação

- [x] 1.1 Em `src/admin/layout/AdminLayout.tsx`, alterar o `<main>` para `flex-1 overflow-hidden` e envolver `<RouteTransition />` num wrapper interno com `mx-auto w-full max-w-7xl p-8`; verificar que `npm run build` passa sem erro de tipo.
- [x] 1.2 Verificar visualmente em viewport largo que o conteúdo centraliza em `/admin`, `/admin/cotacoes` e `/admin/produtos` e que a sidebar continua colapsando/expandindo normalmente.

## 2. Testes

- [x] 2.1 Adicionar teste em `src/admin/layout/AdminLayout.test.tsx` que asserte a presença do wrapper de centralização (container com as classes `max-w-7xl` e `mx-auto`) ao renderizar o layout; verificar que o novo teste passa.
- [x] 2.2 Garantir que os testes existentes de sidebar (destaque de nav, colapso/persistência, links) continuam passando sem alteração; verificar com `npm test`.

## 3. Checagem de saúde

- [x] 3.1 Rodar `npm test`, `npm run build` e `npm run lint` e verificar que os três passam sem erros.
