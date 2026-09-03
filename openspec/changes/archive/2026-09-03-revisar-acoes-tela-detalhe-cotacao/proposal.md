## Why

Pesquisa de UX (posicionamento de ações destrutivas, convenção de "Duplicar"): ações destrutivas não deveriam dividir a mesma fileira compacta que as ações primárias, com o mesmo peso visual; "Duplicar" é tipicamente uma ação secundária (menos frequente que as transições de estado) e deveria ficar num menu overflow, não num botão de primeiro nível.

Hoje, em `CotacaoDetalhePage.tsx`, "Cancelar" (`variant="destructive"`) fica na mesma linha (`flex flex-wrap items-center gap-2`) que os botões de transição primária (Abrir/Encerrar/Reabrir+Apurar), só com `gap-2` de distância — sem nenhuma separação visual adicional. "Duplicar" também fica visível de primeiro nível, ao lado de "Representantes".

Achado secundário, do modal "Representantes": com o status de resposta adicionado (change `gerenciar-finalizacao-de-participantes`), a linha de cada participante ficou mais cheia (2 badges + até 5 ações), e em telas não muito largas o texto de ação (ex. "Reabrir resposta") fica cortado, exigindo rolar horizontalmente pra ler.

## What Changes

- `CotacaoDetalhePage.tsx`: "Duplicar" e "Cancelar" saem de botões de primeiro nível e vão para um menu overflow ("⋯", componente `MenuAcoes` já existente no design system, mesmo padrão já usado em `CotacoesPage.tsx`), com "Cancelar" mantendo destaque visual de destrutivo dentro do menu.
- `RepresentantesModal.tsx`: a linha de cada participante passa a permitir quebra (`flex-wrap`) quando o espaço não é suficiente, em vez de depender só de rolagem horizontal.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o requirement de transições de estado com confirmação é ajustado pra refletir que "Cancelar" é acionado a partir de um menu overflow, não de um botão visível de primeiro nível.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — substituir os botões "Duplicar"/"Cancelar" por um `MenuAcoes`.
- `src/admin/cotacoes/RepresentantesModal.tsx` — permitir quebra de linha na área de badges/ações de cada participante.
