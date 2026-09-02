## Why

Três changes já foram implementadas, commitadas e com CI verde nos dois repositórios (front e back), mas o ciclo do OpenSpec não foi fechado: `commitar-back-e-front/tasks.md` tem os checkboxes 3.1/3.2 marcados localmente e nunca commitados, e as três changes (`commitar-back-e-front`, `corrigir-fade-in-reduced-motion`, `corrigir-flakiness-testes-paralelos`) continuam em `openspec/changes/` ativas mesmo com 100% das tasks concluídas. Isso deixa `openspec list` mostrando trabalho "pendente" que na verdade já foi entregue, e atrapalha começar o próximo trabalho do zero.

## What Changes

- Commitar o checkbox pendente em `commitar-back-e-front/tasks.md`, confirmando (com evidência de `git log`/`gh run list`) que o push e o CI do front e do back foram verificados.
- Arquivar as três changes concluídas com `openspec archive` (move cada uma para `openspec/changes/archive/2026-09-02-<nome>`).
- Commitar o resultado do arquivamento.
- Verificar o estado final: `openspec list` sem changes ativas e `git status` limpo no front.

## Capabilities

### New Capabilities

_Nenhuma — esta change não introduz comportamento novo no produto._

### Modified Capabilities

_Nenhuma — nenhum requisito de comportamento muda. É reorganização de metadados do OpenSpec (`openspec/changes/**`), sem tocar em `src/`, build ou dependências._

## Impact

- Afeta apenas `openspec/changes/**` neste repositório (front). Não toca em código de aplicação, configuração de build/CI ou dependências.
- Não gera novo deploy: o código já em produção nos dois repos permanece exatamente como está.
- Repositório `simplecote-back` não precisa de nenhuma ação (working tree já limpo, já sincronizado com `origin/main`).
