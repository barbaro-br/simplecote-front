## Why

A change irmã `pedido-avulso-empresa-obrigatoria` (`simplecote-back`) torna `empresaId` obrigatório e condição de pagamento obrigatória na criação do Pedido avulso — a tela precisa capturar isso. Aproveitando a mudança, o cabeçalho único (já implementado) ganha os campos que faltam, seguindo um wireframe do dono do produto: Empresa (obrigatória, com Representante derivado e só exibido) e condição de pagamento passam a ser exigidos antes do primeiro item poder ser confirmado.

## What Changes

- Cabeçalho da tela de montagem ganha **Empresa** (combobox do catálogo de fornecedores, obrigatória) — ao escolher, o **Representante** dela aparece como texto (não é campo, é derivado e só leitura).
- **Condição de pagamento** deixa de ser opcional: sem ela, o botão "Adicionar item" (que efetivamente cria o Pedido) fica desabilitado, com um aviso explicando o que falta.
- **Prazo de entrega** continua opcional, sem mudança.
- Nada muda na entrada da tela (já é direta — "Novo pedido" na aba Pedidos já abre a tela de montagem sem pedir título/código).

## Capabilities

### Modified Capabilities
- `admin/pedidos-avulsos`: "Condição de pagamento e prazo de entrega do pedido avulso" (condição vira obrigatória) e nova exigência de Empresa antes do primeiro item.

## Impact

- **Front**: `NovoPedidoAvulsoPage.tsx` — cabeçalho ganha o combobox de Empresa + texto do Representante derivado; botão "Adicionar item" (1º item) desabilitado até Empresa + condição de pagamento estarem preenchidos; `pedidos-avulsos.schema.ts`/`pedidos-avulsos.api.ts` — `CriarPedidoAvulsoRequest` ganha `empresaId`.
- **Depende de**: `pedido-avulso-empresa-obrigatoria` (`simplecote-back`) em produção antes desta ficar funcional de ponta a ponta.
