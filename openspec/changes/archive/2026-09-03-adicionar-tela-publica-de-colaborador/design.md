## Context

`AdicionarItemModal.tsx` (admin) já tem o padrão de busca client-side
sobre a lista de produtos (`useProdutos()`, filtro por texto no nome).
`TemaClaro` (`src/representante/TemaClaro.tsx`) já é o wrapper de rota
usado pelas duas telas públicas existentes do representante, forçando
tema claro — reaproveitar pro colaborador em vez de duplicar.

Não existe hoje nenhum componente de leitura de código de barras por
câmera no front (apesar de `@zxing/browser` estar listado como stack do
projeto em `AGENTS.md`) — a busca nesta primeira versão é só texto
(nome ou dígitos do código de barras já cadastrado), sem câmera.

## Decision

**Rota**: adicionar `{ path: '/colaborador/:token', element:
<ColaboradorPage /> }` como terceiro filho do wrapper `<TemaClaro>` em
`routes.tsx`, ao lado de `/cotacao/:token` e `/pedido/:token`.

**`colaborador.api.ts`**: três hooks React Query —
`useEstadoColaborador(token)` (`GET /public/colaborador/{token}`),
`useProdutosColaborador(token)` (`GET
/public/colaborador/{token}/produtos`), `useAdicionarItemColaborador(token)`
(mutation, `POST /public/colaborador/{token}/itens`).

**`ColaboradorPage.tsx`**: mobile-first (375px primeiro, AGENTS.md regra
7). Três estados:
1. Carregando → skeleton simples.
2. Sem Cotação `RASCUNHO` → mensagem clara ("Nenhuma cotação em rascunho
   no momento") + nome da loja, sem formulário.
3. Com Cotação `RASCUNHO` → título da cotação no topo, campo de busca
   (mesmo padrão de filtro client-side de `AdicionarItemModal`), lista de
   resultados clicável, e ao selecionar um produto um campo de
   quantidade + botão "Adicionar". No sucesso: `toast.success` e reset da
   seleção/busca, mantendo a tela pronta pro próximo item (fluxo
   pensado pra repetir várias vezes seguidas, sem recarregar).

**Configurações**: em `ConfiguracoesPage.tsx`, uma seção somente-leitura
mostrando `${window.location.origin}/colaborador/${configuracao.linkColaboradorToken}`
com um botão "Copiar" (mesmo padrão de retorno visual "Copiado!" já usado
em outros pontos do produto, ex. `RepresentantesModal`).

## Alternatives Considered

- **Reaproveitar `AdicionarItemModal` como componente compartilhado**
  entre admin e colaborador: rejeitado — o modal do admin é
  desktop-first e vive dentro de um `Dialog` autenticado; a tela do
  colaborador é uma página inteira, mobile-first, pública. Mais simples
  replicar o padrão de busca (poucas linhas) do que forçar reuso de um
  componente com pressupostos de contexto diferentes.
