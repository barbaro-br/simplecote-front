## Why

O back (change `pedido-avulso`, `simplecote-back`) já expõe a API pra registrar um Pedido avulso — uma venda fechada por telefone com um Representante, fora do fluxo de Cotação. Falta a tela no admin onde o lojista efetivamente monta esse pedido enquanto está ao telefone: buscar o produto, informar preço da embalagem e quantidade, ver o total calculado, e fechar.

## What Changes

- Nova tela "Novo pedido avulso" no admin: busca de produto (reaproveita `useSugestoesCadastro`/`useMaisSugestoesDoCatalogoGlobal` já existentes em `admin/produtos/produtos.api.ts`), campo de preço da embalagem + quantidade de embalagens por item, lista dos itens já adicionados com preço unitário derivado e total de linha, total geral e contagem no rodapé, ação de fechar o pedido.
- Cliente de API novo (`pedidos-avulsos.api.ts`) consumindo os endpoints do back: criar, adicionar item, fechar, consultar.
- Nova entrada de navegação pra abrir a tela.

## Capabilities

### New Capabilities
- `admin/pedidos-avulsos`: tela de montagem de um Pedido avulso — busca de produto, entrada de preço/quantidade por embalagem, lista de itens com total calculado, fechamento do pedido.

### Modified Capabilities
(nenhuma — a tela é nova, não muda comportamento de tela existente)

## Impact

- **Novo**: `admin/pedidos-avulsos/` (tela, hooks de API), rota nova, entrada de navegação.
- **Reaproveitado sem mudança de comportamento**: `admin/produtos/produtos.api.ts` (`useSugestoesCadastro`, `useMaisSugestoesDoCatalogoGlobal`).
- **Depende de**: change `pedido-avulso` (`simplecote-back`) já implementada e no ar — os endpoints `POST /api/pedidos/avulsos`, `POST /api/pedidos/avulsos/{id}/itens`, `POST /api/pedidos/avulsos/{id}/fechar`, `GET /api/pedidos/avulsos/{id}` precisam existir em produção antes desta change entrar em uso real (o contrato da API está no design.md daquela change, não redesenhado aqui).
