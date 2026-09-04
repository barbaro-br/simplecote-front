## Context

O back irmão já entregou a outra metade: `DELETE /api/participantes/{id}` (`ParticipanteService.desconvidar`) está implementado e arquivado no `simplecote-back` (change `2026-09-04-permitir-desconvidar-representante`), com a regra de domínio: remoção inteira do Participante (Lances e correções de lance inclusos), restrita a Cotações `RASCUNHO`/`ABERTA` e a participantes que não estejam `RESPONDIDO`. O front não tem que decidir regra nenhuma — só disparar o `DELETE` e refletir o resultado.

O modal que recebe a mudança (`src/admin/cotacoes/RepresentantesModal.tsx`) está, no working tree atual, num estado pós-refactor (mudança irmã `melhorar-gestao-de-finalizacao-de-representantes`, em andamento nos mesmos arquivos):

- RASCUNHO: cada linha é uma Empresa selecionável; o círculo/check à esquerda do avatar marca a seleção (toggle no clique da linha).
- ABERTA (e demais status não-`RASCUNHO` via `isAberta`): a lista mostra **todas** as Empresas (convidados primeiro, sem o filtro "só convidados" e sem o toggle "Ver todas" que existiam antes); linhas com participante exibem badge de status + botões inline Finalizar/Reabrir sob o nome (não mais menu "⋯"); linhas sem participante exibem o botão "Convidar" à direita.
- O hook `useDesconvidarParticipante(cotacaoId)` já existe em `cotacoes.api.ts` (invalida `participantes` e `aoVivo` ao concluir). **O modal já importa `useDesconvidarParticipante` e `ConfirmarDialog` sem usá-los — `tsc` está vermelho (TS6133) por causa desses imports órfãos**; a implementação desta change os consome (e remove qualquer sobra).

Motivação em proposal.md ("Why"); requisitos observáveis em `specs/admin/cotacoes/spec.md`.

## Goals / Non-Goals

**Goals:**
- Tornar o círculo/check da esquerda o único ponto de convite **e** desconvite no modo `ABERTA`, absorvendo o botão "Convidar" — mesma linguagem visual que o Comprador já conhece do modo `RASCUNHO`.
- Bloquear no próprio affordance o que o back rejeita: participante `RESPONDIDO` não é clicável; fora de `ABERTA` o círculo novo não aparece (nada de clique que nasce morto).
- Erro de `DELETE` (ex.: o participante finalizou entre o load e o clique) mantém a linha e a mensagem vem de `ApiError.message` (regra 5 do `spec.md`), nunca um genérico quando a API mandou o motivo em pt-BR.

**Non-Goals:**
- Não alterar o comportamento do modo `RASCUNHO` (círculo continua sendo toggle de seleção; nada de `DELETE` lá — não há participante ainda).
- Não mexer em `ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA`: nesses status a linha fica exatamente como está hoje (sem círculo novo; botão "Convidar" preservado onde já existe). Desconvidar não se aplica fora de `ABERTA` — o back rejeita e o spec delta escopa a mudança para Cotação `ABERTA`.
- Não adicionar estado otimista nem rollback manual: o padrão do modal (convidar/finalizar/reenviar) é mutation → `invalidateQueries` → refetch; o sumiço do participante vem do servidor.
- Não tocar no layout que a mudança irmã de finalização deixou (badge + botões inline sob o nome), nem no contrato de participantes.

## Decisions

- **Círculo novo renderiza e interage apenas quando `status === 'ABERTA'`** (não `isAberta`). O spec delta e o back escopam convite/desconvite a `ABERTA`; em `ENCERRADA`/`PEDIDOS_GERADOS` o modal continua como está. Alternativa considerada — reaproveitar `isAberta` (qualquer status não-`RASCUNHO`) — descartada: mostraria um círculo clicável que o back rejeitaria em `ENCERRADA`/`PEDIDOS_GERADOS`, e mudaria o visual de status fora do escopo do spec delta.
- **Um único componente de círculo com três estados visuais e um handler por estado** (máquina de estados do clique, espelhando `!!part` + `participanteStatus`):

```
                estado do círculo no modo ABERTA
  ===================================================================
  linha sem participante (part ausente)
      circulo vazio (borda)          clique  -> convidar (POST .../participantes [empresaId])
  linha com participante CONVIDADO | VISUALIZOU
      circulo marcado (check)        clique  -> ConfirmarDialog -> DELETE /api/participantes/{id}
  linha com participante RESPONDIDO
      circulo marcado, inerte        clique  -> nada (nao e botao; span inerte)
```

  Implementação: em vez de duplicar o bloco `{!isAberta && (...)}` atual, extrair o círculo para renderização nos dois modos, com `size` menor no modo `ABERTA` (spec delta exige "menor nesse contexto") e semântica/`onClick` diferentes por modo; no modo `ABERTA` o círculo é um `<button type="button">` real (a11y) com `ev.stopPropagation()`, e o estado `RESPONDIDO` é um elemento não-interativo (ex.: `<span aria-hidden>`) — nunca um botão desabilitado que recebe foco e sugere ação.
- **Desconvidar segue o padrão "Excluir Cotação" de `CotacoesPage.tsx`**: `ConfirmarDialog` com `titulo` nomeando a empresa (ex.: "Desconvidar {nome}"), `descricao` nomeando a consequência irreversível ("o representante e qualquer preço já preenchido serão removidos, sem volta"), `rotuloConfirmar="Desconvidar"`, `pendente={desconvidar.isPending}`. Estado local no modal guarda o alvo (`{participanteId, nome}`) enquanto o diálogo está aberto; confirmar chama `useDesconvidarParticipante(cotacaoId).mutateAsync(participanteId)`.
- **Erro exibido via toast com `ApiError.message`** (filtrado `SessaoExpiradaError` → retorna silencioso), no mesmo lugar onde as outras ações do modal erram (finalizar/reenviar hoje fazem `toast.error`). Diálogo fecha no erro, como em `CotacoesPage` (que fecha e mostra o erro em `ErrorAlert`); no modal o toast cumpre esse papel. A linha permanece na lista porque não há update otimista — o `invalidateQueries` do hook só roda no sucesso.
- **Remover o botão "Convidar" apenas no modo `ABERTA`** (bloco `isAberta && !e.part`), substituído pelo círculo vazio clicável. Manter o botão onde ele existe em status não-`ABERTA`, para não mudar comportamento fora do escopo.
- **`tasks.md` reconciliado com a árvore**: task 1.1 marcada como já implementada no working tree (hook presente em `cotacoes.api.ts`); tasks 2.x/3.x reescritas contra o layout atual (badge + botões inline sob o nome, lista sem filtro "só convidados", círculo apenas em `ABERTA`) e contra a semântica real de "some da lista de convidados" (a Empresa não sai da listagem — sai do conjunto convidado: círculo esvazia, badge e botões de participante somem).

## Risks / Trade-offs

- [Círculo com dois significados (seleção em RASCUNHO vs. convidado em ABERTA) pode confundir] → o spec delta pede explicitamente reaproveitar a mesma metáfora visual; o estado `ABERTA` é o único ponto de decisão irreversível e por isso exige confirmação nomeando a consequência. O círculo `RESPONDIDO` inerte (marcado, não-interativo) comunica "já finalizou, sem volta".
- [Condição por `status === 'ABERTA'` em vez de `isAberta` pode dessincronizar se o modal ganhar status futuro] → é a mesma janela de negócio do back; se o domínio mudar (ex.: permitir desconvidar em `ENCERRADA`), o back muda primeiro e esta condição acompanha a spec.
- [Árvore hoje vermelha por imports órfãos desta mesma change] → a implementação consome `useDesconvidarParticipante` e `ConfirmarDialog` (ou os remove se o layout final não precisar); a checagem de saúde (`tsc -b`, `lint`, `vitest`) é parte das tasks e volta a verde antes do fim.
- [Working tree compartilhado com a change irmã de finalização (mesmos arquivos)] → o diff desta change deve tocar só as linhas que o spec delta exige e rodar a suíte completa ao final; se a irmã ainda estiver em andamento, o e2e (4.1) depende do back local, não do código irmão.

## Migration Plan

1. Implementar as tasks 2.x/3.x no front (o back já está no ar/arquivado).
2. Verificação e2e (4.1) contra o back local: convidar pelo círculo, desconvidar `CONVIDADO` e `VISUALIZOU`, confirmar que `RESPONDIDO` não clica.
3. Sem rollback especial: mudança de front isolada e aditiva sobre endpoint já existente; reverter é remover o círculo do modo `ABERTA` e restaurar o botão "Convidar".
