## 1. Configuração do estilo

- [x] 1.1 Estender o formulário de `ConfiguracoesPage.tsx` (de `configuracoes-da-loja-basico`) com o campo "Estilo de navegação" (`Lateral` / `Inferior`); persistir via API junto com os demais campos.
- [x] 1.2 Expor o valor atual via `useConfiguracaoLoja()` (mesmo hook criado em `configuracoes-da-loja-basico`).

## 2. Componente de barra inferior

- [x] 2.1 Criar `src/admin/layout/BottomNavBar.tsx`: 4 itens fixos (`Dashboard`, `Cotações`, `Produtos`) + botão "Mais"; cada item com ícone + rótulo de texto.
- [x] 2.2 Implementar o menu/sheet de "Mais" com os itens restantes (`Empresas`, `Usuários`, `Análises`, `Configurações`).
- [x] 2.3 Barra fixa na parte inferior (`fixed bottom-0`), sempre visível, sem interferir no scroll do conteúdo (reaproveitar o container de scroll de `fixar-sidebar-e-scroll-admin`).

## 3. Integrar no shell

- [x] 3.1 `AdminLayout.tsx`: ler o estilo configurado e renderizar `<Sidebar>` ou `<BottomNavBar>` condicionalmente, mantendo o mesmo `<main>` de conteúdo nos dois casos.
- [x] 3.2 Verificar que, com `Inferior` ativo, o conteúdo de `<main>` continua centralizado (requirement `admin/layout` "Conteúdo centralizado") e a barra continua visível durante o scroll (requirement "Navegação permanece visível durante o scroll").
- [x] 3.3 Verificar que trocar o estilo nas Configurações reflete imediatamente na sessão ativa, sem exigir reload.

## 4. Testes e verificação final

- [x] 4.1 Estender `AdminLayout.test.tsx` para cobrir os dois estilos (navegação funcional, item ativo destacado, logout acessível) em cada um.
- [x] 4.2 Conferência visual (dev server) do estilo `Inferior` em viewport largo — avaliar se o resultado é aceitável ou se precisa de ajuste antes de considerar a change concluída (ver risco documentado em `design.md`).
- [x] 4.3 Rodar `npm test` completo e confirmar 0 regressões.
