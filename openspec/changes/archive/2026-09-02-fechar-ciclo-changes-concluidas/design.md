## Context

Ver `proposal.md` para a motivação. Estado atual confirmado antes de escrever este design:

- `simplecote-front` e `simplecote-back` estão ambos com `origin/main` sincronizado (`git rev-list --left-right --count` = `0 0` nos dois) e com CI verde no último push (`gh run list`: `e46c9c9`/front e `e4f63a9`/back, ambos `success`).
- Nenhuma das três changes a arquivar (`commitar-back-e-front`, `corrigir-fade-in-reduced-motion`, `corrigir-flakiness-testes-paralelos`) tem `specs/` (deltas), então arquivar não envolve merge em `openspec/specs/`.
- `simplecote-back` já está com working tree limpo — nada a fazer lá.

## Goals / Non-Goals

**Goals:**
- Cada passo (confirmar checkbox, arquivar, commitar arquivamento) deve ser um commit independente e revertível.
- `openspec list` deve terminar sem nenhuma change ativa.
- Nenhuma mudança fora de `openspec/changes/**`.

**Non-Goals:**
- Não é objetivo desta change re-verificar build/CI — isso já foi confirmado como pré-condição (ver Context).
- Não mexe no repositório `simplecote-back` (nada pendente lá).
- Não cria nem modifica specs (`skip_specs: true` no `.openspec.yaml` desta change).

## Decisions

- **Commit do checkbox separado do commit de arquivamento.** Alternativa considerada: juntar tudo em um commit só. Rejeitada porque o padrão já estabelecido no repo (ver `commitar-back-e-front/proposal.md`: "commits granulares por change/task") é manter cada intenção em um commit próprio — "confirmar estado" é diferente de "reorganizar diretório".
- **Arquivar as 3 changes com `openspec archive <nome>` individual, uma por vez**, em vez de um comando em lote. Se uma falhar validação, as outras duas não ficam bloqueadas e o problema fica isolado.
- **Ordem de arquivamento**: `commitar-back-e-front` primeiro (é a que teve o checkbox confirmado no passo anterior), depois as outras duas em qualquer ordem — não há dependência entre elas (arquivos e specs distintos, nenhuma com deltas).
- **Um único commit para as 3 movidas de arquivamento**, não um commit por change. É um `git mv` mecânico sem risco independente por change; três commits só geraria ruído no histórico.
- **`skip_specs: true` nesta change** (já registrado no `.openspec.yaml`): nenhum requisito de comportamento muda, é reorganização de metadados. Evita inventar uma "capability" artificial só pra passar em `openspec validate`.

## Risks / Trade-offs

- [Risco] Começar um trabalho novo referenciando uma das 3 changes "ativas" antes desta ser aplicada → Mitigação: aplicar esta change antes de iniciar qualquer novo trabalho, como já é a intenção declarada.
- [Risco] `openspec archive` falhar validação em alguma das changes antigas (ex.: schema exigir algo que elas não têm) → Mitigação: rodar uma change por vez, checar a saída de cada comando antes de seguir para a próxima; se falhar, parar e reportar em vez de continuar às cegas.
- [Risco] Commit acidental de arquivos fora do escopo (ex.: algo solto na árvore) → Mitigação: `git add` explícito por caminho, nunca `git add -A`/`-u` cego; revisar `git status`/`git diff --stat` antes de cada commit.

## Migration Plan

1. `git add openspec/changes/commitar-back-e-front/tasks.md` → commit → push.
2. `openspec archive commitar-back-e-front` → `openspec archive corrigir-fade-in-reduced-motion` → `openspec archive corrigir-flakiness-testes-paralelos` (um por vez, validando a saída de cada um).
3. `git add openspec/changes` → commit único → push.
4. Verificação: `openspec list --json` sem changes ativas; `git status` limpo.

**Rollback**: cada commit é independente e revertível com `git revert <hash>` sem efeito colateral nos outros — o commit de arquivamento só move arquivos dentro de `openspec/changes/`, então revertê-lo restaura as pastas originais das 3 changes.
