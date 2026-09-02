## 1. Detectar largura na barra inferior

- [x] 1.1 Em `BottomNavBar.tsx`, adicionar detecção de largura via `window.matchMedia('(min-width: 768px)')` (mesmo padrão de `lerTelaEstreita` em `AdminLayout.tsx`), com estado inicial lido de `window.matchMedia` e listener de `change` para atualizar em tempo real (resize da janela).

## 2. Renderizar todos os itens em tela larga

- [x] 2.1 Quando a largura for ≥768px, renderizar todos os 7 itens (união de `ITENS_FIXOS` + `ITENS_MAIS`) diretamente na barra, sem o botão "Mais".
- [x] 2.2 Quando a largura for <768px, manter o comportamento atual (3 fixos + "Mais" com os outros 4).
- [ ] 2.3 Verificar visualmente (dev server, redimensionar a janela cruzando 768px) que a barra alterna corretamente entre os dois modos, inclusive em tempo real sem precisar recarregar.

## 3. Testes e verificação final

- [x] 3.1 Estender/criar teste para `BottomNavBar.tsx` cobrindo os dois casos (largura estreita: 3+Mais; largura larga: todos os itens, sem Mais).
- [x] 3.2 Rodar `npm test` completo e confirmar 0 regressões.
