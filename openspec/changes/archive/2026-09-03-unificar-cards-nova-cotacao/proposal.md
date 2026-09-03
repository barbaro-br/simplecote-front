## Why

Pesquisa de UX (formulários curtos vs. wizard multi-etapa): pra formulários com poucos campos e sem lógica condicional forte entre eles, o padrão recomendado é um formulário único, não etapas/cards separados. `NovaCotacaoPage.tsx` hoje tem 2 `Card`s empilhados verticalmente com um divisor "Ou" entre eles — "Criar em branco" (só título) e "Duplicar existente" (seleção de cotação de origem) — mas as duas opções levam ao mesmo lugar (uma nova Cotação, navegando pro detalhe) e usam `useCriarCotacao`/`useDuplicarCotacao` como dois caminhos alternativos de uma mesma decisão, não duas tarefas distintas.

Discussão à parte, revisando o resultado da change `revisar-acoes-tela-detalhe-cotacao` (que moveu "Duplicar" pra um menu overflow na tela de detalhe): duplicar uma Cotação não faz sentido como ação disponível **enquanto já se está trabalhando dentro dela**, nem como ação solta numa linha da lista — é uma decisão de "por onde eu começo uma Cotação nova", que pertence ao momento de criar uma. Duplicar SHALL passar a existir **só** dentro do fluxo "Nova Cotação" — nem na tela de detalhe, nem na lista de Cotações.

## What Changes

- `NovaCotacaoPage.tsx`: os 2 cards viram 1, com um seletor (ex.: dois botões tipo abas, "Em branco" / "Duplicar existente") escolhendo o modo; o campo relevante pra cada modo (Título, ou o `<select>` de cotação de origem) aparece condicionalmente dentro do mesmo card, com um único botão de submit no rodapé.
- `CotacaoDetalhePage.tsx`: remove "Duplicar" do menu overflow (fica só "Cancelar", quando aplicável ao status).
- `CotacoesPage.tsx`: remove "Duplicar" do menu de cada linha da lista (fica "Ver detalhes" e "Excluir").

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o requirement de criação e duplicação de Cotação é reescrito — duplicar passa a ser uma ação disponível só no formulário de Nova Cotação, não mais na lista nem na tela de detalhe.

## Impact

- `src/admin/cotacoes/NovaCotacaoPage.tsx` — reestruturação do layout, sem mudar nenhuma chamada de API (`useCriarCotacao`/`useDuplicarCotacao` continuam as mesmas).
- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — remove o item "Duplicar" do `MenuAcoes` (adicionado pela change `revisar-acoes-tela-detalhe-cotacao`).
- `src/admin/cotacoes/CotacoesPage.tsx` — remove o item "Duplicar" do `MenuAcoes` de cada linha, e o hook `useDuplicarCotacao`/`aoDuplicar` que só existiam pra ele.
