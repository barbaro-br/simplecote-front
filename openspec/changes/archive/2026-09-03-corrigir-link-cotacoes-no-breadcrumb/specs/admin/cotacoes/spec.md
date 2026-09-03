## MODIFIED Requirements

### Requirement: Navegação entre as telas de Cotações via breadcrumb

O sistema SHALL exibir, na tela de detalhe da Cotação e na tela de Resultado da apuração, uma trilha de navegação (breadcrumb) numa linha própria acima do título, nunca dividindo espaço com botões de ação. A trilha SHALL refletir a hierarquia `Cotações › {título da Cotação}` (detalhe) ou `Cotações › {título da Cotação} › Resultado` (resultado); todo segmento exceto o atual SHALL ser um link navegável. O segmento "Cotações" SHALL levar à lista de Cotações (`/admin/cotacoes`), não ao Dashboard.

#### Scenario: Breadcrumb na tela de detalhe

- **WHEN** o Comprador abre o detalhe de uma Cotação
- **THEN** a trilha mostra "Cotações › {título da Cotação}", com "Cotações" navegável para a lista e o título da Cotação como segmento atual (não clicável)

#### Scenario: Breadcrumb na tela de resultado

- **WHEN** o Comprador abre o resultado de uma Cotação apurada
- **THEN** a trilha mostra "Cotações › {título da Cotação} › Resultado", com "Cotações" e o título da Cotação navegáveis (o título leva de volta ao detalhe) e "Resultado" como segmento atual

#### Scenario: Breadcrumb não compete por espaço com ações da tela

- **WHEN** a tela de resultado exibe o botão "Baixar XLSX" (ou a tela de detalhe exibe seus botões de transição de estado)
- **THEN** o breadcrumb permanece em sua própria linha, sem quebrar ou se sobrepor a esses botões em nenhuma largura de tela

#### Scenario: "Cotações" leva à lista, não ao Dashboard

- **WHEN** o Comprador clica em "Cotações" no breadcrumb, seja na tela de detalhe ou na tela de resultado
- **THEN** o sistema navega para `/admin/cotacoes` (a lista de Cotações), não para o Dashboard (`/admin`)
