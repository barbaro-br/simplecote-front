## ADDED Requirements

### Requirement: Painel inicial do backoffice com o resumo do SaaS

A rota `/backoffice` SHALL exibir um painel com os KPIs de `GET /api/admin/resumo`: contagem de lojas por estado, lojas ativas nos últimos 30 dias, cotações criadas no mês, GMV total (formatado como moeda), um gráfico dos cadastros dos últimos 30 dias e o funil de ativação em quatro degraus. A listagem de lojas SHALL passar a viver em `/backoffice/lojas`, e o painel SHALL ter um link para ela. O guard, o modo suporte e a rota de detalhe da loja NÃO mudam.

#### Scenario: Dashboard com KPIs

- **WHEN** o `SUPER_ADMIN` abre `/backoffice`
- **THEN** vê os cards de lojas, lojas ativas 30d, cotações no mês e GMV, mais o gráfico de cadastros e o funil

#### Scenario: Lista na rota própria

- **WHEN** o `SUPER_ADMIN` clica em "Ver todas as lojas" (ou em "Lojas" na navegação)
- **THEN** é levado a `/backoffice/lojas`, que mostra a listagem de lojas

#### Scenario: Movimento reduzido / sem lib de gráfico

- **WHEN** o painel renderiza o gráfico de cadastros
- **THEN** ele é desenhado com CSS/SVG inline, sem biblioteca de gráficos nova
