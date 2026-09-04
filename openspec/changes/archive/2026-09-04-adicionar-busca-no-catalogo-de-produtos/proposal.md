## Why

O catálogo de produtos já tem 200+ itens em ambiente de dev e, em produção, um supermercado real terá um catálogo ainda maior. A tela lista todos os produtos numa única tabela alfabética, sem nenhum campo de busca — encontrar um produto específico hoje exige rolar a lista inteira manualmente. A tela de Cotações já tem um padrão de busca ("Buscar cotação...") que deve ser replicado aqui.

## What Changes

- Adicionar um campo de busca no topo da tela de Catálogo de produtos, filtrando a lista por nome do produto ou código de barras (GTIN), em tempo real conforme o usuário digita.
- A busca SHALL ser client-side sobre a lista já carregada (mesmo padrão da busca de cotações), sem nova chamada de API.
- A busca SHALL preservar o comportamento existente de cabeçalho fixo e barra de rolagem estilizada da tabela.

## Capabilities

### Modified Capabilities
- `admin/produtos`: adiciona um requisito de busca/filtro por nome ou código de barras na listagem do catálogo.

## Impact

- `src/admin/produtos/ProdutosPage.tsx` (ou componente equivalente da listagem): novo campo de busca e lógica de filtro client-side.
- Nenhuma mudança de API/backend.
