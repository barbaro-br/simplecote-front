## Context

`admin/produtos/produtos.api.ts` já expõe `useSugestoesCadastro` (página 0, nome + sufixo de código de barras, retorna `doProprioCatalogo` e `doCatalogoGlobal`) e `useMaisSugestoesDoCatalogoGlobal` (scroll infinito, páginas seguintes do catálogo global) — os dois hooks usados em `ProdutoForm.tsx` nesta mesma sessão. Esta change reaproveita os dois sem alteração. Ver proposal.md - Why e design.md da change `pedido-avulso` (`simplecote-back`) pro contrato da API consumida aqui.

## Goals / Non-Goals

**Goals:**
- Montagem rápida de itens durante uma ligação — poucos cliques por item, sem perder o fio da busca.
- Reaproveitar 100% a busca de produto já validada nesta sessão (relevância, busca por palavra, sufixo de código de barras).

**Non-Goals:**
- Edição de um item já confirmado na lista (remover e adicionar de novo cobre o caso, nesta fase).
- Listagem/histórico completo de Pedidos avulsos com filtro por período/representante — fora desta change (ver design.md da change `pedido-avulso` - Non-Goals, mesma decisão).

## Decisions

### 1. Página dedicada, não modal

Diferente de `ProdutoForm`/`AdicionarItemModal` (diálogos), esta tela é uma **rota própria** (ex.: `/admin/pedidos-avulsos/novo`). Alternativa considerada: modal, no mesmo padrão dos outros dois — rejeitada porque o fluxo é mais longo (vários itens, minutos de ligação) e um fechamento acidental do modal (clique fora, Esc) perderia o progresso; uma rota própria sobrevive a navegação acidental e permite usar o botão "voltar" do navegador com segurança (React Router preserva o estado da página).

### 2. Estado local até fechar, sem rascunho no servidor por item

O primeiro item confirmado já dispara `POST /api/pedidos/avulsos` (cria o Pedido no back, `status ABERTO`); os itens seguintes chamam `POST /api/pedidos/avulsos/{id}/itens` um a um — cada item confirmado na tela já está persistido no back, não é só estado local React. Isso significa que se a ligação cair ou o navegador fechar no meio, o Pedido continua `ABERTO` no back com os itens já confirmados até ali (nenhum item digitado, mas não confirmado, é perdido — só itens já validados/enviados sobrevivem, alinhado ao design.md do back, Decisão 5).

### 3. Formulário de item é um mini-formulário inline, não um modal dentro da página

Produto selecionado + preço da embalagem + quantidade de embalagens aparecem numa área fixa da própria página (não um modal por cima) — o lojista repete o ciclo "busca → preço → quantidade → confirma" várias vezes seguidas; abrir/fechar modal a cada item adicionaria cliques desnecessários no meio da ligação.

## Risks / Trade-offs

- **[Risco] Lojista fecha a aba no meio de um item ainda não confirmado** (preço/quantidade digitados, mas não confirmado) → Mitigação: nenhuma nesta fase (Non-Goal de rascunho automático); aceito porque confirmar um item é rápido (poucos campos) e o Pedido em si não perde os itens já confirmados (Decisão 2).
- **[Trade-off] Sem edição nem remoção de item já confirmado nesta fase** (a change `pedido-avulso` do back não expõe endpoint de remoção de item) → aceito como o mesmo Non-Goal do back (design.md da change `pedido-avulso` - Non-Goals: corrigir erro vira um novo Pedido avulso); reavaliar as duas changes juntas se virar reclamação recorrente.
