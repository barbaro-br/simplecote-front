## 1. Catálogo de Condições de Pagamento

- [x] 1.1 `condicoes-pagamento.api.ts` (TanStack Query, mesmo padrão de `empresas.api.ts`): `useCondicoesPagamento`, `useCriarCondicaoPagamento`, `useInativarCondicaoPagamento`, `useAtivarCondicaoPagamento`
- [x] 1.2 `CondicoesPagamentoPage.tsx` (mesmo padrão visual de `EmpresasPage.tsx`): listar (ativas + inativas com aparência apagada), cadastrar, inativar/reativar; rota `/admin/condicoes-pagamento` + entrada de navegação (Configurações ou menu "Mais" — decisão de onde encaixar fica com quem revisar o design visual); teste cobrindo listar, cadastrar, inativar, reativar (spec `admin/condicoes-pagamento`)

## 2. Aba "Pedidos"

- [x] 2.1 `pedidos.api.ts`: `usePedidosAgregados` (`GET /api/pedidos`)
- [x] 2.2 Componente compartilhado de "linha de pedido resumida" (design.md - Decisão 1): Empresa/status/total/quantidade de itens/condição de pagamento/prazo de entrega, com "—" para campos ausentes
- [x] 2.3 `PedidosPage.tsx`: agrupamento por Cotação (título + pedidos) e seção "Avulsos", usando o componente de 2.2; estado vazio quando não há nenhum pedido; rota `/admin/pedidos`; teste cobrindo agrupamento, seção avulsos, campos ausentes com "—" e estado vazio (spec `admin/pedidos` - "Listagem de Pedidos agrupada por Cotação")
- [x] 2.4 Botão "Novo pedido" navegando para `/admin/pedidos-avulsos/novo` (spec `admin/pedidos` - "Criar novo pedido avulso a partir da aba Pedidos"); teste cobrindo a navegação
- [x] 2.5 `BottomNavBar.tsx`: substituir o item "Pedido avulso" por "Pedidos" apontando para `/admin/pedidos` (design.md - Decisão 4); atualizar `BottomNavBar.test.tsx`

## 3. Condição de pagamento preferencial na criação de Cotação

- [x] 3.1 Formulário de Nova Cotação (modo "Em branco"): campo de condição de pagamento preferencial (combobox só com opções do catálogo, sem criar ad-hoc — design.md - Decisão 2), enviado em `POST /api/cotacoes`; teste cobrindo criar com e sem a condição (spec `admin/cotacoes` - "Criar com condição de pagamento preferencial", "Criar sem condição de pagamento preferencial")

## 4. Condição de pagamento e prazo de entrega no Resultado da apuração

- [x] 4.1 `ResultadoPage.tsx`: linha de pedido (via componente de 2.2) passa a mostrar condição de pagamento e prazo de entrega, com "—" quando ausentes; teste cobrindo exibição preenchida e ausente (spec `admin/cotacoes` - "Linha do pedido mostra condição de pagamento e prazo de entrega", "Pedido sem condição de pagamento ou prazo mostra traço")

## 5. Condição de pagamento e prazo de entrega na resposta do representante

- [x] 5.1 Tipo do payload de `GET /public/cotacoes/:token` ganha `condicaoPagamento`, `prazoEntregaEstimado`, `condicoesPagamentoDisponiveis`
- [x] 5.2 Seção nova na tela `/cotacao/:token` (design.md - Decisão 3), fora dos cards de item: combobox de condição de pagamento (só opções do catálogo) + campo de texto de prazo de entrega, pré-preenchidos quando já salvos, desabilitados quando `podeEditar` é falso; autosave com debounce chamando `PUT /public/cotacoes/:token/condicoes`, enviando só o campo alterado; teste cobrindo escolher condição, digitar prazo, pré-preenchimento ao reabrir, e desabilitado sem `podeEditar` (spec `representante/cotacao` - os 4 primeiros scenarios)
- [x] 5.3 Confirmar que finalizar a resposta não exige os dois campos preenchidos (spec `representante/cotacao` - "Campos opcionais não bloqueiam finalizar")

## 6. Condição de pagamento e prazo de entrega no Pedido avulso

- [x] 6.1 `NovoPedidoAvulsoPage.tsx`: combobox de condição de pagamento com opção de digitar valor ad-hoc (design.md - Decisão 2) + campo de texto de prazo de entrega, enviados em `POST /api/pedidos/avulsos`; teste cobrindo escolher do catálogo, digitar ad-hoc, prazo em texto livre, e pedido sem os dois campos (spec `admin/pedidos-avulsos` - os 4 scenarios)

## 7. Documentação

- [x] 7.1 Atualizar `spec.md` (se existir documento de referência equivalente no front) ou deixar as specs arquivadas como única fonte — confirmar convenção do repositório ao implementar
