## Why

Achados de severidade média/baixa no painel admin, encontrados numa rodada
de teste manual completo do sistema (ver `docs/exploracao-ux-2026-09-03.md`)
— agrupados aqui por não justificarem um change dedicado cada um:

1. **Nomenclatura de status inconsistente**: o Dashboard rotula
   `PEDIDOS_GERADOS` como "Apurada" no pipeline de status; a lista de
   Cotações usa "Pedidos gerados" para o mesmo status nos filtros e nos
   badges. Clicar no segmento "Apurada" do dashboard até navega para
   `/admin/cotacoes?status=PEDIDOS_GERADOS`, cuja aba ativa mostra "Pedidos
   gerados" — dois nomes pro mesmo status na mesma jornada.
2. **Preset de prazo vencido continua selecionável**: em "Lançar Cotação", o
   preset "Hoje às 18h" vem pré-selecionado independente da hora atual — depois
   das 18h ele continua clicável e só falha (com erro genérico) depois do
   clique em "Abrir Cotação".
3. **Subtítulo do modal "Adicionar Produtos" não reflete a seleção em
   andamento**: fica em "Nenhum produto adicionado" até clicar "Concluído",
   mesmo com itens já marcados.
4. **Assimetria de confirmação**: "Apurar" pede confirmação explícita
   (correto, é irreversível); "Encerrar" não pede nenhuma, apesar de ser uma
   transição de estado da mesma família.
5. **Nome da loja cortado na sidebar**: "Sara Supermercado" aparece truncado
   como "Sara Super..." mesmo em telas largas (testado 1054px e 1568px) — o
   requirement "Painel utilizável em larguras estreitas" já proíbe texto
   cortado, então é um bug de implementação, não gap de escopo.

## What Changes

- Dashboard: rótulo do segmento `PEDIDOS_GERADOS` no pipeline passa de
  "Apurada" para "Pedidos gerados", igual à lista de Cotações.
- "Lançar Cotação": presets de prazo já vencidos (ex.: "Hoje às 18h" depois
  das 18h) ficam desabilitados, com o preset padrão escolhido de forma
  sensível à hora atual.
- "Adicionar Produtos": subtítulo do cabeçalho passa a refletir a seleção em
  andamento (itens já na cotação + o que está marcado nesta sessão do
  modal), não só os itens já persistidos.
- "Encerrar" passa a exigir confirmação, na mesma linha de "Apurar"/"Cancelar".
- Sidebar: o nome da loja não é mais truncado nas larguras testadas.

## Capabilities

### Modified Capabilities

- `admin/painel-insights`: requirement "Dashboard como página inicial" —
  alinhamento de rótulo de status.
- `admin/cotacoes`: requirements "Criar e duplicar Cotação" (presets de
  prazo), "Montar itens da Cotação" (subtítulo do modal) e "Transições de
  estado com confirmação" (Encerrar passa a confirmar).
- `admin/layout`: requirement "Painel utilizável em larguras estreitas" —
  cenário específico para o nome da loja não ser cortado.

## Impact

- `src/admin/analise/PainelDashboard.tsx`
- `src/admin/cotacoes/AbrirCotacaoDialog.tsx`
- `src/admin/cotacoes/AdicionarItemModal.tsx`
- `src/admin/cotacoes/CotacaoDetalhePage.tsx` (ou onde "Encerrar" é acionado)
- Componente da sidebar (shell administrativo)
