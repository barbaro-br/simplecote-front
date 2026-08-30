## Why

O modal atual para "Adicionar Item" na página de detalhes da cotação utiliza um elemento `<select>` nativo. Quando o sistema escala para centenas ou milhares de produtos cadastrados (ex: 2.000 itens), essa interface se torna inutilizável e lenta, prejudicando a experiência do usuário (UX). Além disso, o fluxo atual exige muitos cliques e a digitação de quantidade antecipada cria fricção no momento da inclusão rápida de múltiplos itens.

## What Changes

- **Layout do Modal**: Substituição do modal pequeno por um modal amplo e otimizado para seleções em massa (similar ao `RepresentantesModal`).
- **Listagem e Busca**: Trocar o dropdown por uma lista de produtos renderizada no corpo do modal, com uma barra de busca no topo para encontrar itens rapidamente.
- **Seleção Multipla (Checkboxes)**: Permitir marcar e desmarcar produtos através de checkboxes.
- **Fluxo de Quantidade**: A quantidade inicial ao selecionar um produto será padronizada para 1 (ou será um campo opcional). O usuário focará em marcar o que precisa comprar primeiro, e poderá ajustar a quantidade diretamente na tabela de itens (que já possui edição em linha) ou durante a apuração.
- **Link Rápido de Cadastro**: O atalho "Não achou? Cadastrar novo produto" será realocado de forma estratégica (ex: ao final da lista ou quando a busca não retornar resultados).

## Capabilities

### New Capabilities
- `cotacoes/selecao-itens-massa`: Modal de seleção otimizada de múltiplos produtos para uma cotação.

### Modified Capabilities
- `cotacoes/edicao-rascunho`: O fluxo de inclusão de item deixará de ser um select simples.

## Impact

- A renderização da lista precisará ser eficiente (talvez paginada visualmente no futuro, mas por enquanto a busca com filtro local resolve o dropdown travado).
- A API de `useAdicionarItem` poderá ser impactada se mudarmos para adicionar múltiplos itens de uma vez. Atualmente a mutation aceita um item por vez. Teremos que decidir se faremos as requisições em paralelo no front ou se faremos chamadas uma a uma (já que o fluxo atual é individual).
