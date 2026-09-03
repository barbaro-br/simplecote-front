## Why

Ao revisar a tela de lançamento de preço do representante com pesquisa de UX (swipe actions em listas mobile), achamos dois gaps reais — mas **não** o que o backlog original supunha. A spec atual (`representante/cotacao`, "Visualização da Cotação por token") já deixa explícito, de propósito, que **não deve existir** um toggle/checkbox pra marcar "não cotado" — o campo vazio já É a marcação, e limpar o campo pelo teclado (backspace) já funciona e já sincroniza como não cotado, exatamente igual ao gesto de deslizar (mesmo código, mesmo caminho de debounce em `ItemLanceCard.tsx`). Ou seja: **não é 100% dependente de touch**, como o backlog registrado presumia — no desktop já dá pra limpar o preço digitando.

Os dois gaps reais, confirmados no código:
1. **Descobrir o gesto de deslizar não é óbvio.** O tutorial de primeira visita (`TutorialOnboarding.tsx`) só *menciona em texto* "deslize um card para limpar" — não mostra o gesto acontecendo. Fora do tutorial, nada no card em repouso sugere que dá pra arrastar (o ícone de "limpar" revelado é `aria-hidden`, só aparece durante o próprio arrasto).
2. **Limpar um preço já digitado (por deslizar OU por teclado) é imediato e sem desfazer.** Pesquisa de UX (LogRocket, UX Planet): pra limpar/reverter um dado já preenchido, o padrão hoje é ação imediata + toast com "Desfazer" por alguns segundos, em vez de bloquear com diálogo de confirmação. Hoje não existe nem uma coisa nem outra — some sem aviso.

## What Changes

- `TutorialOnboarding.tsx`: o passo que já menciona o gesto de deslizar passa a **demonstrar** visualmente (mini-card animado deslizando e revelando o ícone de limpar), não só descrever em texto.
- `ItemLanceCard.tsx`: ao limpar um preço já digitado (por deslizar OU apagando pelo teclado — mesmo caminho de código), exibir um toast "Preço removido" com ação "Desfazer" por alguns segundos, restaurando o valor anterior se acionado.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: os requirements de gesto de deslizar e de tutorial de primeira visita ganham, respectivamente, desfazer e demonstração visual do gesto.

## Impact

- `src/representante/cotacao/TutorialOnboarding.tsx` — animação de demonstração do gesto.
- `src/representante/cotacao/ItemLanceCard.tsx` — toast de desfazer ao limpar preço (no mesmo ponto do código que já trata `valorDebounced === ''`).
- Nenhuma mudança de backend.
