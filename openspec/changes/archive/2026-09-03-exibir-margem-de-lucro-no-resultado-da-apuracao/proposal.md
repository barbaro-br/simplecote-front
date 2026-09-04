## Why

Pedido do usuário (sessão 2026-09-03): na tela de Resultado da apuração,
antes de enviar os pedidos aos fornecedores, o Comprador quer conseguir
prever o preço de venda de cada item — aplicando uma margem de lucro (%)
por cima do preço de custo já apurado — sem sair da tela nem esperar
suporte de backend. É uma conta de exibição em cima de um valor que já
vem pronto da API (preço unitário/da embalagem apurados), não uma
decisão de negócio do front: o front só multiplica, nunca recalcula
vencedor, preço de custo ou qualquer regra da apuração.

## What Changes

- Adicionar um campo "Margem de lucro (%)" **global** na tela de
  Resultado, acima da lista de pedidos. Ao preencher, todo item exibido
  (nas linhas expandidas de cada pedido) passa a mostrar, ao lado do
  preço unitário e do preço da embalagem já existentes, o **preço de
  venda sugerido** (`preço de custo × (1 + margem / 100)`), tanto por
  unidade quanto por embalagem.
- Cada item, dentro da linha expandida do seu pedido, pode **sobrescrever**
  a margem global com uma margem própria (campo pequeno por item,
  pré-preenchido com o valor global, editável individualmente) — mudar
  o campo global não sobrescreve um item que já foi customizado
  manualmente nesta sessão de visualização.
- **Efêmero, não persistido**: a margem (global ou por item) vive só no
  estado do componente `ResultadoPage`. Ao recarregar a página ou
  navegar para outra tela e voltar, o campo volta a ficar vazio (sem
  margem aplicada). Nada é salvo no backend, nada é enviado nos pedidos
  aos fornecedores, e o XLSX/PDF exportados continuam vindo prontos do
  backend, sem a coluna de preço de venda.
- O preço de venda é **só exibição**: nunca substitui, nunca é enviado
  em nenhuma chamada de API, e é claramente rotulado como "sugestão" na
  interface, para não ser confundido com o preço de custo real que vai
  para o fornecedor.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Resultado da apuração e pedidos" —
  adiciona um campo de margem de lucro (global e por item, efêmero) que
  calcula e exibe um preço de venda sugerido ao lado do preço de custo
  já apurado.

## Impact

- `src/admin/cotacoes/ResultadoPage.tsx`
