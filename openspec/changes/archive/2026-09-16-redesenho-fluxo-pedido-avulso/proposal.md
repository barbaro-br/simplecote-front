## Why

O fluxo atual de criação de pedido avulso exige que o usuário preencha empresa e condição de pagamento **na mesma tela** da grade de itens, em uma barra de contexto colapsada. Isso causa confusão: o usuário clica em "Adicionar item" sem ter preenchido os campos obrigatórios e recebe um toast de erro. Além disso, o visual da tela diverge do padrão brutalista/planilha já adotado nas telas de cotação — que o próprio usuário já aprovou e quer replicar aqui.

## What Changes

- **Modal de pré-configuração** (`ConfigurarPedidoModal`): ao clicar em "Novo pedido avulso" na `PedidosPageV2`, abre um modal estilo planilha onde o usuário seleciona empresa (com busca e auto-preenchimento de representante e pedido mínimo), condição de pagamento (com criação inline) e prazo de entrega. Só após confirmar o modal é que o `POST /api/pedidos/avulsos` acontece e o usuário vai para a tela de montagem.
- **`NovoPedidoAvulsoPage` reformulada**: remove o bloco de seleção de empresa/condição da barra de contexto; a tela começa diretamente na grade de itens (empresa/condição/rep são exibidos como cabeçalho somente-leitura). Mantém a persistência antecipada — o pedido já existe no back antes de o modal de busca abrir.
- **Visual brutalista consistente**: cabeçalho, grade de itens e barra de rodapé seguem o padrão de `CotacoesPageV2` (`#111813`, `rounded-none`, thead `#17221b`, ícones `size-4 weight="bold"`). Remove todos os `rounded-md/lg` da tela.
- **Tela de conclusão enriquecida**: ao fechar o pedido, exibe opções de "Baixar PDF" (`GET /api/pedidos/{id}.pdf`) e "Reenviar e-mail" (`POST /api/pedidos/{id}/enviar`) além dos links de navegação já existentes.

## Capabilities

### New Capabilities
- `pedidos-avulsos/configurar-pedido-modal`: Modal de pré-configuração (`ConfigurarPedidoModal`) com busca de empresa, auto-fill de representante/pedido-mínimo, seleção de condição de pagamento (com criação inline) e campo de prazo de entrega.

### Modified Capabilities
- `pedidos-avulsos/montar-pedido`: Tela de montagem (`NovoPedidoAvulsoPage`) reformulada — empresa/condição passam a vir da URL/back (somente-leitura), visual brutalista, tela de conclusão com PDF/e-mail.

## Impact

- **Arquivos alterados**: `NovoPedidoAvulsoPage.tsx`, `NovoPedidoAvulsoPage.test.tsx`, `PedidosPageV2.tsx` (onde o botão "Novo pedido avulso" dispara o novo modal).
- **Arquivo novo**: `ConfigurarPedidoModal.tsx` (+ teste inline ou arquivo próprio `ConfigurarPedidoModal.test.tsx`).
- **APIs consumidas** (já existem, nenhuma nova): `useEmpresas`, `useRepresentantes`, `useCondicoesPagamento`, `useCriarCondicaoPagamento`, `useCriarPedidoAvulso`, `baixarPedidoPdf`, `useReenviarPedido`.
- **Zero nova dependência**.
- Não altera contratos de API nem tipos exportados de `pedidos-avulsos.schema.ts`.
