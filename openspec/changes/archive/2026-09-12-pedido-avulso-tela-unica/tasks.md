## 1. Empresa e Representante no cabeçalho

- [x] 1.1 `pedidos-avulsos.schema.ts`: `CriarPedidoAvulsoRequest`/tipo de envio ganha `empresaId` (obrigatório)
- [x] 1.2 `NovoPedidoAvulsoPage.tsx`: combobox de Empresa (`useEmpresas()`) no cabeçalho, ao lado dos campos já existentes; ao escolher, busca em `useRepresentantes()` o registro com `empresaId` igual e exibe o nome como texto (design.md - Decisão 1); teste cobrindo escolher a Empresa e ver o Representante aparecer (spec - "Escolher Empresa mostra o Representante dela")
- [x] 1.3 `empresaId` entra no payload de `POST /api/pedidos/avulsos` junto do primeiro item

## 2. Travar confirmação até os obrigatórios estarem prontos

- [x] 2.1 Botão "Adicionar item" (1º item, antes do Pedido existir) fica `disabled` enquanto Empresa ou condição de pagamento estiverem vazias, com texto indicando o que falta (design.md - Decisão 2); teste cobrindo os três estados (faltando Empresa, faltando condição, os dois preenchidos) (spec - "Empresa é obrigatória pra confirmar o primeiro item", "Condição de pagamento é obrigatória pra confirmar o primeiro item")
- [x] 2.2 Confirmar que itens seguintes (Pedido já criado) não são afetados por essa trava — ela só vale pro primeiro item

## 3. Documentação

- [x] 3.1 Atualizar `spec.md` (se existir documento de referência equivalente) ou deixar a spec arquivada como única fonte
