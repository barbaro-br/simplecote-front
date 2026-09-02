## Why

Hoje, se um representante digita preços mas esquece de finalizar a resposta, o Comprador não tem nenhuma visibilidade disso na tela de detalhe da Cotação, nem qualquer jeito de agir — só descobre o problema depois de apurar, quando percebe que a Empresa "não ganhou nada" mesmo tendo cotado (foi o que aconteceu num teste manual real). O back (`permitir-finalizar-participante-pelo-admin`, `simplecote-back`) vai expor um endpoint pro admin finalizar em nome do participante; falta o front dar visibilidade ao estado de cada participante e consumir esse endpoint.

Nota lateral: a spec já descreve "Admin reabre a resposta de um participante" como implementado (`admin/cotacoes` §"Correção de lance e reabertura de resposta pelo admin"), e o hook `useReabrirParticipante` já existe em `cotacoes.api.ts`, mas não há nenhum componente que o use hoje — essa change também fecha essa lacuna, colocando as duas ações (finalizar / reabrir) juntas no mesmo lugar.

## What Changes

- Nova seção "Participantes" na tela de detalhe da Cotação (visível em `ABERTA`/`ENCERRADA`, ao lado da grade ao vivo): lista cada participante com nome da Empresa/representante e status (`Convidado`/`Visualizou`/`Respondido`).
  - Participante `VISUALIZOU`: botão "Finalizar em nome do participante" (novo endpoint do back).
  - Participante `RESPONDIDO`: botão "Reabrir resposta" (endpoint já existente, hook já existente, só faltava a UI).
- Diálogo de confirmação de "Apurar" passa a avisar quando existem participantes `VISUALIZOU` (engajaram mas não finalizaram) antes de o Comprador confirmar.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes`: o requirement de correção/reabertura de lance pelo admin ganha a ação de finalizar em nome do participante e uma seção de participantes visível na tela; o requirement de transições de estado ganha o aviso de participantes pendentes no diálogo de Apurar.

## Impact

- `src/admin/cotacoes/cotacoes.api.ts` — novo hook `useFinalizarParticipante`, espelhando `useReabrirParticipante`.
- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — nova seção de participantes; aviso no diálogo de Apurar.
- Novo componente (ex.: `ParticipantesPainel.tsx`) — lista de participantes com status e ações.
- `src/admin/cotacoes/ConfirmarDialog.tsx` — aceitar conteúdo adicional (`children`) abaixo da descrição, pra caber a lista de pendentes no diálogo de Apurar sem duplicar o componente.
- **Depende do backend** (`permitir-finalizar-participante-pelo-admin`, `simplecote-back`) para o botão "Finalizar" funcionar; a seção de participantes e o aviso no Apurar (que só leem `GET /api/cotacoes/{id}/participantes`, já existente) funcionam independentemente disso.
