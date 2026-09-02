## 1. Sidebar colapsa automaticamente em tela estreita

- [ ] 1.1 Em `AdminLayout.tsx`, detectar largura de tela abaixo de 768px (ex. `window.matchMedia('(max-width: 767px)')` com listener de resize) e forçar `isExpanded = false` nesse caso, ignorando `colapsada`/`isHovered`.
- [ ] 1.2 Ocultar ou desabilitar o botão de toggle (`PanelLeftClose`/`PanelLeftOpen`) abaixo de 768px.
- [ ] 1.3 Desabilitar o hover-to-expand (`onMouseEnter`/`onMouseLeave`) abaixo de 768px.
- [ ] 1.4 Verificar visualmente (dev server, resize da janela) que a sidebar permanece em modo ícone ao cruzar 768px, e volta ao comportamento normal (toggle + hover) acima disso.

## 2. Grids do Dashboard por container query

- [ ] 2.1 Em `PainelDashboard.tsx`, adicionar `@container` no elemento wrapper apropriado (ex. o `<main>`/container de conteúdo, ou um wrapper dedicado na própria página).
- [ ] 2.2 Trocar `grid-cols-1 md:grid-cols-3` (linhas 48, 92) por `grid-cols-1 @md:grid-cols-3` (ou breakpoint de container equivalente); mesmo para `md:grid-cols-2` (linha 207).
- [ ] 2.3 Verificar visualmente em 768px que o card "Gastos" (e os demais) exibem todo o conteúdo, sem corte ou sobreposição — reproduzir exatamente o cenário que a auditoria encontrou antes de considerar corrigido.

## 3. Verificação final

- [ ] 3.1 Testar em pelo menos 3 larguras (768px, ~500px, ~390px) que nenhum texto fica cortado/sobreposto no Dashboard.
- [ ] 3.2 Rodar `npm test` completo e confirmar 0 regressões, incluindo `AdminLayout.test.tsx`.
