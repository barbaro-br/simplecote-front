## Context

`NovaCotacaoPage.tsx` (completo, 142 linhas): dois `Card`s independentes, cada um com seu próprio submit — "Criar em branco" (`aoCriar`, chama `useCriarCotacao().mutateAsync(values)` com `{titulo}`) e "Duplicar existente" (`aoDuplicar`, chama `useDuplicarCotacao().mutateAsync(origemId)`, sem título — o backend decide o nome da cópia). Os dois navegam pro mesmo lugar em caso de sucesso (`navigate(/admin/cotacoes/${id})`). Não há nenhuma dependência de dado entre os dois modos.

`CotacaoDetalhePage.tsx` tem hoje um `MenuAcoes` com `{Duplicar, Cancelar}` (adicionado pela change `revisar-acoes-tela-detalhe-cotacao`, aplicada antes desta). `CotacoesPage.tsx` tem um `MenuAcoes` por linha com `{Ver detalhes, Duplicar, Excluir}` — `duplicar`/`aoDuplicar` só existem nesse arquivo pra esse item de menu.

## Goals / Non-Goals

**Goals:**
- Reduzir a tela a uma única decisão visível (qual modo) em vez de dois formulários competindo por atenção com um divisor "Ou" no meio.
- Não mudar nenhuma chamada de API nem validação já existente — é reorganização de layout.
- Consolidar "duplicar" num único ponto de entrada (o formulário de Nova Cotação) — hoje existe em 3 lugares fazendo a mesma coisa; remover a redundância dos outros 2.

**Non-Goals:**
- Não adiciona nenhum campo novo (ex.: não passa a permitir escolher um título customizado ao duplicar) — mantém exatamente o comportamento atual de cada modo.

## Decisions

- **Seleção de modo por duas abas/botões (não um `<select>` nem checkbox)** — só 2 opções, mutuamente exclusivas, sempre visíveis; abas são o padrão mais direto pra esse número de opções (mais simples que um dropdown de 2 itens).
- **Título "some" (não fica desabilitado) quando o modo é "Duplicar existente"** — ele não é usado nesse modo (o backend decide o nome da cópia), então mostrá-lo desabilitado só confundiria; melhor removê-lo do fluxo visual enquanto esse modo está selecionado.
- **Um só botão de submit no rodapé**, cujo rótulo e ação mudam com o modo (`"Criar cotação"` chamando `aoCriar` / `"Duplicar cotação"` chamando `aoDuplicar`) — não dois botões de submit competindo.
- **Remover "Duplicar" da tela de detalhe e da lista, não só reduzir seu destaque** — motivo do usuário: duplicar é uma decisão de "por onde eu começo uma Cotação nova", não uma ação que faz sentido enquanto já se está dentro de uma Cotação existente trabalhando nela, nem solta numa linha de lista. Único ponto de entrada, sem redundância.

## Risks / Trade-offs

- [Risco] Quem já se acostumou a duplicar a partir da lista ou do detalhe precisa aprender o novo caminho (ir em "Nova Cotação"). Aceitável — é a mesma ação, um clique a mais até "Nova Cotação", e o resultado final (nova Cotação a partir de uma existente) é idêntico.
