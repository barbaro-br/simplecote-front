## Proposal: Alterar Favicon

**Problema:**
O sistema está utilizando o ícone padrão do Vite na aba do navegador, o que não passa credibilidade nem identidade visual própria para a aplicação (Sarah Supermercado Cotações).

**Solução Proposta:**
Criar um ícone (favicon) simples e limpo usando um formato SVG que contenha um emoji de carrinho de compras (🛒) ou prancheta de cotação (📋), ou gerar um SVG limpo. Substituir o ícone padrão (`vite.svg` ou `favicon.ico`) referenciado no `index.html`.

**Escopo:**
- `index.html`: Atualizar a tag `<link rel="icon">`.
- `public/`: Adicionar o novo arquivo `favicon.svg`.
