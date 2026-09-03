## Context

`RepresentantesModal` já recebe `status` (status da Cotação) como prop e já
tem `const isAberta = status !== 'RASCUNHO'` (usado para outra decisão). O
gate que falta é: `Finalizar`/`Reabrir resposta` só quando
`status === 'ABERTA' || status === 'ENCERRADA'`.

O status de convite vem de `conviteStatus` (`'ENVIADO' | 'FALHOU'`, nunca
nulo — participantes sem tentativa de envio não existem nesse fluxo, já que
o convite é disparado no momento de abrir a Cotação).

## Goals / Non-Goals

**Goals:**
- Botões de finalizar/reabrir só aparecem quando têm efeito real
  (`podeEditar` do representante só é possível com Cotação `ABERTA`; o caso
  `ENCERRADA` já é coberto pelo requirement existente e mantido).
- Falha de envio de e-mail fica visualmente distinta de "não enviado ainda".

**Non-Goals:**
- Não muda a lógica de quando reenviar convite está disponível (já é
  independente do status da Cotação, conforme requirement "Convidar
  Empresas").
- Não adiciona retry automático de envio — só melhora a visibilidade do
  estado de falha.

## Decisions

- **Gate por `status`, não por uma nova prop**: reutilizar a prop `status`
  já recebida pelo componente. `const podeGerenciarResposta = status ===
  'ABERTA' || status === 'ENCERRADA'` e usar isso para envolver o bloco que
  hoje só checa `participanteStatus`.
- **Três estados visuais pro convite**: `ENVIADO` (verde, como hoje),
  `FALHOU` (vermelho/destaque de erro, com texto "Falha no envio"),
  qualquer outro valor futuro cai no "Não enviado" neutro atual — sem quebrar
  se o backend um dia adicionar um novo valor ao enum.

## Risks / Trade-offs

- [Risco] Nenhum — é estritamente remover um caminho que já não tinha
  efeito útil, e adicionar informação (não remove nenhuma ação válida).
