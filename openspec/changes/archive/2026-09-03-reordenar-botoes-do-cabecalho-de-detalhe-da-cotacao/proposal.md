## Why

Pedido do usuário: hoje o cabeçalho da tela de detalhe da Cotação tem o
botão de transição primária (Abrir/Encerrar/Reabrir+Apurar) à esquerda, e
"Cancelar" + "Representantes" agrupados à direita. O usuário quer
"Representantes" mais perto do botão de transição primária — já que convidar
representantes é o passo natural depois de abrir a cotação — e "Cancelar"
isolado, sozinho do lado oposto, reduzindo ainda mais o risco de clique
acidental nele (reforça o requirement já existente de separação espacial do
Cancelar).

## What Changes

- Mover o botão "Representantes" para o **mesmo grupo** do botão de
  transição primária (à esquerda), ficando ao lado de "Abrir" (ou
  "Encerrar"/"Reabrir"+"Apurar", conforme o status).
- "Cancelar" permanece sozinho no grupo `ml-auto` (extremo direito),
  isolado dos demais botões.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Transições de estado com confirmação" —
  reposiciona "Representantes" ao lado do botão de transição primária, e
  mantém "Cancelar" isolado no extremo oposto da fileira de ações.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx`
