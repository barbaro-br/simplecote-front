## Nota de execução

O popover de linha do tempo (item 3 abaixo) foi implementado e depois **removido** a pedido explícito do usuário durante a revisão de layout ao vivo do card de representantes — o ícone de informação não faz mais parte da UI. Os outros dois itens (finalizar a partir de `Convidado`; aviso + finalização em massa antes de "Encerrar") seguem como descritos e implementados. Ver `tasks.md` seção 3 para o histórico completo.

## Why

Hoje a apuração só considera lances de participantes já `RESPONDIDO`. Isso cria dois problemas reais para o Comprador: (1) um representante que preencheu preços mas esqueceu de clicar em "Finalizar" tem seus preços silenciosamente descartados na apuração, sem qualquer aviso no momento em que ainda dá para agir; (2) um representante que nunca abriu o link não pode ser "fechado" individualmente — fica pendurado como `Convidado` até a Cotação inteira ser encerrada, sem uma ação clara de "não vai responder, pode ignorar". Além disso, o card do representante não mostra quando cada evento (convite, visualização, resposta) aconteceu, dificultando cobrar quem está atrasado.

## What Changes

- O admin passa a poder finalizar a resposta de um participante a partir de `Convidado` (hoje só é permitido a partir de `Visualizou`) — mesmo botão "Finalizar", mesma consequência (trava a resposta como está, aqui com zero itens cotados), sem novo status.
- O diálogo de confirmação de "Encerrar" passa a avisar quando existem participantes com pelo menos um lance `Cotado` que ainda não estão `Respondido` — quem preencheu preço mas esqueceu de finalizar — e oferece finalizar a resposta deles em massa, com um clique, antes de encerrar. (Diferente do aviso já existente no diálogo de "Apurar", que lista todo `Visualizou` sem filtrar por quem realmente preencheu algo, e chega tarde demais para corrigir com um clique.)
- Cada linha do modal "Representantes" ganha um ícone de informação (i) com um popover mostrando a linha do tempo do participante: convidado às, convite enviado/falhou às, visualizou às, respondeu às — usando os timestamps já expostos pelo backend, mais o novo `visualizadoEm` (ver proposta irmã no repo `simplecote-back`).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `admin/cotacoes`: "Correção de lance e reabertura de resposta pelo admin" — Finalizar passa a valer também para participantes `Convidado`, não só `Visualizou`. "Transições de estado com confirmação" — o diálogo de "Encerrar" ganha aviso + finalização em massa de participantes com lance cotado e ainda não respondidos. Novo requirement para o popover de linha do tempo no card do representante.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`: menu "⋯" passa a oferecer "Finalizar" também para `Convidado`; novo ícone de info com popover de timeline.
- `src/admin/cotacoes/CotacaoDetalhePage.tsx`: diálogo de "Encerrar" ganha a lista de pendentes-com-preço e ação de finalizar em massa (reaproveita `useFinalizarParticipante`, mesmo padrão de `Promise.allSettled` já usado em "Enviar Restantes").
- Dado da Grade ao Vivo (`GET /api/cotacoes/{id}/ao-vivo`, já consumido) é suficiente para calcular quem tem lance `Cotado` sem `Respondido` — nenhuma nova chamada de API para o aviso de Encerrar.
- Depende da proposta irmã no repo `simplecote-back` (mudança de mesmo nome) para: (a) `Participante.finalizar()` aceitar `CONVIDADO`; (b) expor `conviteEnviadoEm`/`respondidoEm` e o novo `visualizadoEm` em `GET /api/cotacoes/{id}/participantes`.
