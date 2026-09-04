## Why

Pedido do usuário: a tabela do Catálogo de Produtos ganhou seu próprio
contêiner de rolagem vertical (change `fixar-cabecalho-e-polir-tabela-do-
catalogo-de-produtos`, já implementada) para manter o cabeçalho fixo com
catálogos grandes. Essa barra de rolagem usa hoje a aparência padrão do
navegador, que destoa visualmente do resto do design system.

## What Changes

- Adicionar uma classe utilitária global (`.scrollbar-fina`, em
  `src/index.css`) que estiliza a barra de rolagem (`::-webkit-scrollbar`
  para Chrome/Edge/Safari, `scrollbar-width`/`scrollbar-color` para
  Firefox) com trilho transparente e "polegar" fino usando os tokens de
  cor do tema (`--border`/`--muted-foreground`), coerente nos temas claro
  e escuro.
- Aplicar essa classe no contêiner de rolagem da tabela de produtos
  (`ProdutosPage.tsx`).

## Capabilities

### Modified Capabilities

- `admin/produtos`: requirement "Listagem do Catálogo" — a barra de
  rolagem do contêiner da tabela usa uma aparência estilizada consistente
  com o tema, em vez da aparência padrão do navegador.

## Impact

- `src/index.css`
- `src/admin/produtos/ProdutosPage.tsx`
