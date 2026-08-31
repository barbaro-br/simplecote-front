## 1. Ajustes de Teste

- [x] 1.1 Alterar `src/admin/layout/AdminLayout.test.tsx`: incluir `await user.hover(document.body)` (ou mover o hover para fora do aside) logo após o clique em "Recolher menu", garantindo que a barra lateral não fique presa no estado `isHovered === true`.
- [x] 1.2 Rodar os testes no terminal (`npm test -- src/admin/layout/AdminLayout.test.tsx`) e verificar se passam com sucesso.
