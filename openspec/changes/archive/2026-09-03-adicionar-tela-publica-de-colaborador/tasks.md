## 0. Pré-requisito

- [x] 0.1 Confirmar que a change `permitir-colaborador-adicionar-itens-por-link` (repo `simplecote-back`) já está implementada e as rotas `/public/colaborador/{token}/**` respondem — sem isso, os passos abaixo não têm API pra consumir.

## 1. API client

- [x] 1.1 Criar `src/colaborador/colaborador.schema.ts` com os tipos de resposta (`EstadoColaborador { nomeLoja: string; cotacaoRascunho: { id: string; titulo: string } | null }`, reaproveitar o tipo `Produto` já existente de `admin/produtos/produtos.schema.ts` para a lista de produtos).
- [x] 1.2 Criar `src/colaborador/colaborador.api.ts`: `useEstadoColaborador(token)`, `useProdutosColaborador(token)` (ambos `useQuery`), `useAdicionarItemColaborador(token)` (`useMutation`, `POST /public/colaborador/{token}/itens`).

## 2. Tela pública

- [x] 2.1 Criar `src/colaborador/ColaboradorPage.tsx`: lê `token` via `useParams()`, chama `useEstadoColaborador(token)`.
- [x] 2.2 Estado de carregamento: skeleton simples.
- [x] 2.3 Estado sem Cotação RASCUNHO: mensagem clara + nome da loja, sem formulário.
- [x] 2.4 Estado token inválido (API responde como recurso inexistente): tela de "link inválido", mesmo padrão de `CotacaoPorTokenPage`.
- [x] 2.5 Estado com Cotação RASCUNHO: título da cotação, campo de busca de produto (filtro client-side sobre `useProdutosColaborador`, por nome ou código de barras — mesmo padrão de `AdicionarItemModal.tsx`), lista de resultados clicável.
- [x] 2.6 Ao selecionar um produto: campo de quantidade + botão "Adicionar", chamando `useAdicionarItemColaborador`; sucesso mostra `toast.success` e reseta seleção/busca; erro exibe a mensagem sem perder a seleção.

## 3. Rota

- [x] 3.1 Em `routes.tsx`: adicionar `{ path: '/colaborador/:token', element: <ColaboradorPage /> }` como filho do wrapper `<TemaClaro>`, ao lado de `/cotacao/:token` e `/pedido/:token`.

## 4. Configurações

- [x] 4.1 Em `configuracoes.schema.ts`: adicionar `linkColaboradorToken: string` ao tipo de resposta (somente leitura, não faz parte do schema de submit).
- [x] 4.2 Em `ConfiguracoesPage.tsx`: exibir `${window.location.origin}/colaborador/${configuracao.linkColaboradorToken}` em modo somente leitura, com botão "Copiar" (mesmo padrão de retorno visual "Copiado!" já usado em `RepresentantesModal`).

## 5. Testes

- [x] 5.1 Teste: `ColaboradorPage` sem Cotação RASCUNHO mostra a mensagem de ausência, sem formulário.
- [x] 5.2 Teste: `ColaboradorPage` com Cotação RASCUNHO permite buscar, selecionar e adicionar um produto, chamando a API com o `produtoId`/`quantidade` corretos.
- [x] 5.3 Teste: token inválido mostra o estado de "link inválido".
- [x] 5.4 Teste: `ConfiguracoesPage` exibe o link do colaborador e o botão de copiar funciona.
- [x] 5.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 6. Verificação visual

- [x] 6.1 Testar manualmente (dev, com o backend da change de pré-requisito rodando, viewport 375px): copiar o link em Configurações, abrir numa aba anônima, buscar um produto, adicionar com uma quantidade, e confirmar que o item aparece na cotação (conferindo na tela de detalhe da cotação no admin). **(verificado visualmente pelo dono do produto em 05/09/2026)**
- [x] 6.2 Testar o caso de dois envios do mesmo produto (simulando dois colaboradores) e confirmar que a quantidade soma em vez de dar erro. **(verificado visualmente pelo dono do produto em 05/09/2026)**
