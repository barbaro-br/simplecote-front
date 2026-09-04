## Context

Esta mudança depende da proposta irmã de mesmo nome no repo `simplecote-back`: `Participante.finalizar()` passa a aceitar `CONVIDADO` além de `VISUALIZOU`, e `GET /api/cotacoes/{id}/participantes` passa a expor `conviteEnviadoEm`, `respondidoEm` e um novo `visualizadoEm` (coluna nova — hoje só o `status` muda para `VISUALIZOU`, sem timestamp). Sem essa mudança no back, o botão de finalizar em massa e o popover de timeline não têm o que consumir. Ver proposal.md do back para o detalhe da migration e da regra de domínio.

## Goals / Non-Goals

**Goals:**
- Evitar que preço real preenchido por um representante seja descartado da apuração por ele simplesmente esquecer de clicar em "Finalizar".
- Dar ao Comprador uma forma de fechar a resposta de quem nunca abriu o link, sem esperar a Cotação inteira encerrar.
- Mostrar quando cada evento do participante aconteceu, sem exigir nova chamada de API além da já usada pelo modal "Representantes".

**Non-Goals:**
- Não estamos mudando a lógica de apuração (`ApuracaoService`) — ela já ignora corretamente quem não é `RESPONDIDO` ou não tem lance `COTADO`; esta mudança só facilita chegar em `RESPONDIDO` a tempo.
- Não estamos adicionando um novo status de participante (ex.: "Excluído") — `Respondido` com zero itens cotados já expressa "fora da disputa" sem precisar de um enum novo.
- Não estamos mudando o rótulo do badge de status no card (`Convidado`/`Visualizou`/`Respondido` continuam como estão) — só o conteúdo do novo popover de info.

## Decisions

- **Reaproveitar "Finalizar" em vez de criar "Excluir participante"**: `ApuracaoService.apurar` já filtra por `participanteStatus == RESPONDIDO` e `lance.status == COTADO`; finalizar um `CONVIDADO` sem lances cotados já produz exatamente o efeito de "fora da disputa", sem estado novo, sem tocar na apuração.
- **Cálculo do aviso de "Encerrar" 100% no front**: a Grade ao Vivo (`GET /api/cotacoes/{id}/ao-vivo`) já traz, por item, o preço e status de cada participante. O diálogo de Encerrar cruza isso com `participanteStatus` (já carregado via `GET /api/cotacoes/{id}/participantes` pelo modal de Representantes) para achar quem tem ao menos uma célula `COTADO` e ainda não é `RESPONDIDO`. Nenhum endpoint novo é necessário para a detecção.
- **Finalizar em massa via N chamadas sequenciais/paralelas ao endpoint existente**: mesmo padrão já usado em `handleDispararTodosEmail` (RepresentantesModal.tsx) com `Promise.allSettled` sobre `POST /api/participantes/{id}/finalizar` — não é necessário um endpoint de finalização em lote no back. Consequência aceita: N requisições HTTP em vez de uma transação atômica; se algumas falharem, o diálogo mostra o restante ainda pendente (mesmo tratamento de sucesso parcial já usado no reenvio de convites).
- **`visualizadoEm` é uma coluna nova, não um cálculo derivado**: hoje `Participante.marcarVisualizado()` só muda o `status`; não há timestamp de quando isso aconteceu. Alternativa considerada — inferir a partir de algum outro registro (ex. log de acesso) — descartada por não existir esse log hoje; mais simples e mais correto persistir o instante diretamente no agregado.

## Risks / Trade-offs

- [Finalizar em massa é best-effort, não atômico] → o diálogo recalcula a lista de pendentes após o `Promise.allSettled` e mostra quem ainda falhou, para o Comprador tentar de novo ou seguir manualmente pelo menu "⋯".
- [Popover de timeline depende de dado que só existe a partir do deploy da mudança no back] → participantes convidados antes do deploy simplesmente não têm `visualizadoEm` retroativo; o popover omite o evento que não tem timestamp (coerente com o comportamento normal para "respondeu" antes de responder).
- [As duas propostas (front e back) precisam ser implementadas e deployadas juntas] → a proposta do back não é uma mudança de API que quebra o front atual (campos novos são aditivos), então a ordem de deploy não é crítica, mas o botão de finalizar em massa e o popover só fazem sentido depois que o back estiver no ar.

## Migration Plan

1. Implementar e mergear a mudança no `simplecote-back` primeiro (migration da coluna `visualizado_em`, regra de domínio relaxada, DTO estendido) — aditivo, não quebra o front atual.
2. Implementar a mudança no `simplecote-front` (menu "⋯" com Finalizar para `Convidado`, aviso + finalizar em massa no diálogo de Encerrar, popover de timeline).
3. Sem rollback especial: cada lado é aditivo isoladamente; reverter qualquer um dos dois não quebra o outro (o front degrada bem se o back não expuser os timestamps — o popover simplesmente mostra menos linhas).
