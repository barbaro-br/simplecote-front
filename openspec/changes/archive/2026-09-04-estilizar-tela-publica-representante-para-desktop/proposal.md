## Why

A tela pública `/cotacao/:token` foi desenhada mobile-first (com a barra de ação/contexto fixa na base da viewport), o que é correto para o uso principal (representante respondendo pelo celular). Em telas largas (desktop), porém, o resultado hoje é uma lista de itens estreita ancorada no topo esquerdo, sem nenhum cabeçalho com o nome da loja, deixando um grande vazio no meio/direita da tela — um representante que abre o link no computador tem uma experiência visualmente pobre, mesmo a tela sendo funcional.

## What Changes

- Adicionar um layout específico para viewports largos (desktop) da tela `/cotacao/:token`, sem alterar o comportamento mobile já especificado (barra de ação fixa na base, gestos de deslizar, tutorial, etc. continuam mobile-only ou como já definidos).
- Em desktop, o conteúdo (lista de itens, saudação, contexto da loja) SHALL ficar centralizado com uma largura máxima confortável de leitura, evitando tanto o esticamento total da lista quanto o vazio atual.
- Considerar um cabeçalho visível no topo em desktop com o nome da loja/comprador, já que a barra fixa na base (pensada para polegar em mobile) não é a interação natural em desktop.

## Capabilities

### Modified Capabilities
- `representante/cotacao`: adiciona um requisito de layout para viewports largos (desktop), sem alterar os requisitos mobile já existentes.

## Impact

- Componente(s) da tela `/cotacao/:token` no front — apenas CSS/layout responsivo (breakpoints), sem mudança de lógica de autosave, fila, gestos ou dados.
- Nenhuma mudança de API/backend.
