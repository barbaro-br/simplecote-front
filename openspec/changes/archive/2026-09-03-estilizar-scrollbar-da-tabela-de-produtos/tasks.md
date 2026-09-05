## 1. Utilitário de scrollbar

- [x] 1.1 Em `src/index.css`, adicionar a classe `.scrollbar-fina` com as regras `scrollbar-width`/`scrollbar-color` (Firefox) e `::-webkit-scrollbar`/`::-webkit-scrollbar-track`/`::-webkit-scrollbar-thumb`/`::-webkit-scrollbar-thumb:hover` (Chrome/Edge/Safari), usando `var(--border)` e `var(--muted-foreground)` — funciona automaticamente nos temas claro e escuro por herdar os tokens.

## 2. Aplicar em Produtos

- [x] 2.1 Em `ProdutosPage.tsx`, adicionar a classe `scrollbar-fina` na `<div>` de rolagem da tabela (`overflow-x-auto overflow-y-auto max-h-[...]`).

## 3. Verificação visual

- [x] 3.1 Testar manualmente (dev, com os 200+ produtos de teste já semeados): rolar a tabela e conferir visualmente a barra de rolagem fina e com a cor do tema, no claro e no escuro (alternando `.dark` na raiz, se houver como testar). **(verificado visualmente pelo dono do produto em 05/09/2026)**
