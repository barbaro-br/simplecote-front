## Why

Achado verificado ao vivo: o modo "Duplicar existente" de "Nova Cotação"
usa um `<select id="origem">` nativo do navegador para escolher a
cotação de origem. Funciona, mas é o único controle nativo (sem estilo
do design system) no meio de um formulário todo em shadcn/base-ui, e não
tem busca — à medida que o histórico de cotações cresce, rolar uma
`<select>` nativa para achar uma pelo nome fica ruim.

## What Changes

- Criar um componente compartilhado `Combobox` (`src/shared/components/ui/combobox.tsx`),
  seguindo o mesmo padrão de popover já usado em `menu-acoes.tsx`
  (`@base-ui/react` Popover): botão de gatilho estilizado como os demais
  inputs do design system, painel com campo de busca (filtra a lista
  client-side pelo texto) e lista de opções selecionáveis por clique ou
  teclado (setas + Enter), fechando ao selecionar ou pressionar Escape.
- Trocar o `<select id="origem">` de `NovaCotacaoPage.tsx` por esse
  `Combobox`, mantendo o mesmo estado (`origemId`) e comportamento (nada
  selecionado desabilita "Duplicar").

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Criar e duplicar Cotação" — troca o
  controle de seleção da cotação de origem de `<select>` nativo para um
  combobox com busca, sem mudar o comportamento de duplicação em si.

## Impact

- `src/admin/cotacoes/NovaCotacaoPage.tsx`
- `src/shared/components/ui/combobox.tsx` (novo)
