## Why
O sistema atual precisa de ajustes na experiência e usabilidade, tanto no Painel do Administrador (Comprador) quanto na tela do Representante. A interface de visualização de pedidos gerados pode se tornar confusa quando um fornecedor ganha dezenas de itens. Além disso, a clareza de botões como "Marcar como enviado" e a falta de um recibo (PDF) para o representante comprometem a rastreabilidade. Por fim, o estilo do Representante está destoante da linguagem visual consolidada no restante do sistema (brutalista, cantos quadrados).

## What Changes
1. **Painel / Resultados / Pedidos Gerados**:
   - Limitamos a altura máxima (10 a 15 itens) da lista ("sanfona") de itens ganhos por empresa, adotando um scroll vertical para evitar perda de navegação;
   - Renomeamos o botão de ação rápida "Marcar como enviado" para "Enviar por e-mail", tornando claro que a ação dispara a comunicação com PDF anexo ao fornecedor.
2. **Área do Representante / Cotação**:
   - Disponibilizamos um botão "Baixar Recibo (PDF)" da proposta para resguardo do representante quando a cotação é encerrada;
   - Aplicamos a linguagem de design brutalista e de cantos quadrados (`rounded-none`, borders marcadas, paleta contábil) mas preservamos o **TemaClaro** e a prioridade mobile.

## Capabilities
### Modified Capabilities
- `cotacoes/apuracao`: ajustes na sanfona de fornecedores e botão de envio na aba de Pedidos Gerados (`ResultadoPage` / `PedidosPage`).
- `representante/cotacao`: Reestilização brutalista (com TemaClaro) da `CotacaoPorTokenPage` (cards de preços, campos e modais) e introdução do botão para download do PDF.
