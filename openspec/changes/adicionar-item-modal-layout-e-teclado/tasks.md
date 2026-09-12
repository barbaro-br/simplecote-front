## 1. Layout da sugestão do catálogo global

- [x] 1.1 Linha da sugestão global reaproveita o layout do próprio catálogo (ícone, nome, subtítulo, botão "Adicionar")
- [x] 1.2 Blocos do estado vazio viram `<li>` da mesma `<ul>` (correção incidental de HTML — `<div>` direto dentro de `<ul>`)

## 2. Navegação por teclado

- [x] 2.1 `indiceAtivo`/`indiceAtivoClamped` (índice derivado, sem `useEffect` de reset) sobre a lista visível (próprio catálogo ou sugestão global)
- [x] 2.2 Seta cima/baixo move o item ativo (destacado); `scrollIntoView` acompanha
- [x] 2.3 Enter aciona o item ativo (`selecionarNoIndice`); hover do mouse também atualiza o item ativo

## 3. Testes

- [x] 3.1 Sugestão global mostra ícone + código + botão "Cadastrar e adicionar" (mesmo layout)
- [x] 3.2 Seta pra baixo + Enter seleciona o item ativo no próprio catálogo
- [x] 3.3 Enter na base compartilhada cadastra a sugestão ativa
- [x] 3.4 `npx tsc --noEmit`, `oxlint`, `vitest run` (suíte completa) e `npm run build` verdes
