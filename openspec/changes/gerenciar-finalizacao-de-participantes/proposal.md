## Why

Hoje, se um representante digita preços mas esquece de finalizar a resposta, o Comprador não tem nenhuma visibilidade disso na tela de detalhe da Cotação, nem qualquer jeito de agir — só descobre o problema depois de apurar, quando percebe que a Empresa "não ganhou nada" mesmo tendo cotado (foi o que aconteceu num teste manual real). O back (`permitir-finalizar-participante-pelo-admin`, `simplecote-back`) vai expor um endpoint pro admin finalizar em nome do participante; falta o front dar visibilidade ao estado de cada participante e consumir esse endpoint.

Nota lateral: a spec já descreve "Admin reabre a resposta de um participante" como implementado (`admin/cotacoes` §"Correção de lance e reabertura de resposta pelo admin"), e o hook `useReabrirParticipante` já existe em `cotacoes.api.ts`, mas não há nenhum componente que o use hoje — essa change também fecha essa lacuna, colocando as duas ações (finalizar / reabrir) juntas no mesmo lugar.

## What Changes

- O modal "Representantes" (`RepresentantesModal.tsx`), que já muda de "Convidar Empresas" pra "Representantes Convidados" quando a Cotação está `ABERTA`/`ENCERRADA` e já mostra o status do convite por linha, passa a mostrar também o status da resposta (`Convidado`/`Visualizou`/`Respondido`) e a ação aplicável:
  - Participante `VISUALIZOU`: botão "Finalizar em nome do participante" (novo endpoint do back).
  - Participante `RESPONDIDO`: botão "Reabrir resposta" (endpoint já existente, hook já existente, só faltava a UI).
  - Decisão explícita: **não** um botão/modal novo — é a mesma lista de participantes vista de dois ângulos (convite e resposta); um segundo modal duplicaria a lista e confundiria o Comprador sobre onde olhar.
- Diálogo de confirmação de "Apurar" passa a avisar quando existem participantes `VISUALIZOU` (engajaram mas não finalizaram) antes de o Comprador confirmar.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes`: o requirement de correção/reabertura de lance pelo admin ganha a ação de finalizar em nome do participante, exibida junto ao status da resposta no modal "Representantes" já existente; o requirement de transições de estado ganha o aviso de participantes pendentes no diálogo de Apurar.

## Impact

- `src/admin/cotacoes/cotacoes.api.ts` — novo hook `useFinalizarParticipante`, espelhando `useReabrirParticipante`.
- `src/admin/cotacoes/RepresentantesModal.tsx` — cada linha (quando `isAberta`) passa a mostrar também o status da resposta e o botão de ação aplicável (`Finalizar`/`Reabrir resposta`), ao lado do que já existe para o convite.
- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — aviso no diálogo de Apurar (nenhuma seção/modal novo).
- `src/admin/cotacoes/ConfirmarDialog.tsx` — aceitar conteúdo adicional (`children`) abaixo da descrição, pra caber a lista de pendentes no diálogo de Apurar sem duplicar o componente.
- **Depende do backend** (`permitir-finalizar-participante-pelo-admin`, `simplecote-back`) para o botão "Finalizar" funcionar; o resto (status da resposta no modal e o aviso no Apurar, que só leem `GET /api/cotacoes/{id}/participantes`, já existente) funciona independentemente disso.
