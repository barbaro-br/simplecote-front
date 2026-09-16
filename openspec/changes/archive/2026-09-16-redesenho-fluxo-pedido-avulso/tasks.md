## 1. ConfigurarPedidoModal — novo componente

- [x] 1.1 Criar `src/admin/pedidos-avulsos/ConfigurarPedidoModal.tsx`: modal estilo planilha com campo de busca de empresa (Combobox), exibição somente-leitura do representante ao selecionar, Combobox de condição de pagamento com criação inline, campo de prazo de entrega e botão "Abrir pedido". Validação com zod: `empresaId` obrigatório; condição e prazo opcionais. Ao confirmar, chama `useCriarPedidoAvulso()` e navega para `/admin/pedidos-avulsos/{id}`. Verificar: componente renderiza sem erro e os campos de empresa/condição aparecem no DOM.

- [x] 1.2 Criar `src/admin/pedidos-avulsos/ConfigurarPedidoModal.test.tsx` com testes: (a) modal renderiza com campos empresa e condição; (b) submit sem empresa exibe erro de validação; (c) submit com empresa válida chama `POST /api/pedidos/avulsos` via MSW e navega para `/:id`; (d) auto-exibe representante ao selecionar empresa com representante. Verificar: `npm test` passa todos os 4 testes.

## 2. PedidosPageV2 — integrar o modal

- [x] 2.1 Em `src/admin/pedidos/PedidosPageV2.tsx`, substituir a navegação direta `navigate('/admin/pedidos-avulsos/novo')` do botão "Novo pedido avulso" pelo estado local `modalCriarAberto` que abre `ConfigurarPedidoModal`. Verificar: clicar no botão abre o modal (sem navegar imediatamente).

## 3. NovoPedidoAvulsoPage — reformulação visual e de fluxo

- [x] 3.1 Remover o bloco de seleção de empresa/condição/prazo (o grid `sm:grid-cols-3` com Comboboxes) da barra de contexto de `NovoPedidoAvulsoPage.tsx`. Manter apenas o bloco de leitura (empresa, representante, condição, prazo já criados). Remover estados locais `empresaId`, `condicaoPagamentoId`, `prazoEntregaEstimado`, `representante`, hooks `useEmpresas`, `useRepresentantes`, `useCondicoesPagamento`, `useCriarCondicaoPagamento`, `aoCriarCondicaoPagamento` e a lógica de "criar pedido antes de abrir modal de item" — agora o pedido sempre já existe quando a tela monta. Verificar: build sem erro de TypeScript.

- [x] 3.2 Adicionar redirect: se `NovoPedidoAvulsoPage` montar sem `rotaId` (URL `/admin/pedidos-avulsos/novo`), redirecionar imediatamente para `/admin/pedidos` com `toast.info('Inicie o pedido pelo botão "Novo pedido avulso"')`. Verificar: navegar para `/admin/pedidos-avulsos/novo` sem id redireciona para `/admin/pedidos`.

- [x] 3.3 Aplicar visual brutalista à tela de montagem: cabeçalho da página com ícone `ShoppingCart` (`size-4 weight="bold"`), `rounded-none` em todos os elementos, thead com `bg-[#17221b]`, fundo geral alinhado ao padrão de `CotacoesPageV2`. Verificar: sem `rounded-md`, `rounded-lg` ou `rounded-xl` no JSX da tela.

- [x] 3.4 Enriquecer a tela de conclusão (`fechado && pedido`): adicionar botão "Baixar PDF" (chama `baixarPedidoPdf(pedido.id)` de `cotacoes.api.ts`, exibe erro via toast) e botão "Reenviar e-mail" (chama `useReenviarPedido()`). Manter botões "Ir para o Dashboard" e "Novo pedido". Verificar: a seção de fechado renderiza os 4 botões no DOM.

## 4. Testes atualizados de NovoPedidoAvulsoPage

- [x] 4.1 Atualizar `src/admin/pedidos-avulsos/NovoPedidoAvulsoPage.test.tsx`: remover testes que verificavam a seleção de empresa/condição na tela (comportamento removido). Adicionar teste do redirect quando sem `rotaId`. Adicionar teste do cabeçalho somente-leitura (empresa/representante/condição) quando pedido carregado. Verificar: `npm test` passa sem falhas e sem testes editados além dos necessários.

## 5. Checagem de saúde final

- [x] 5.1 Rodar `npm test` e confirmar 0 falhas. Rodar `npm run build` sem erros de TypeScript. Rodar `npm run lint` sem erros novos (warnings pré-existentes tolerados).
