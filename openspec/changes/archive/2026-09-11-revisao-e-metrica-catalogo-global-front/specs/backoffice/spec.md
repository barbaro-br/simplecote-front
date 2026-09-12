## ADDED Requirements

### Requirement: Revisão do catálogo global

O backoffice SHALL ter uma tela ("Catálogo Global") que lista as entradas do catálogo global compartilhado, ordenadas da mais recente para a mais antiga, com busca por nome ou código de barras e filtro para mostrar só entradas ainda não revisadas. A tela SHALL permitir corrigir o nome e a marca de uma entrada (sem alterar o código de barras) e marcar uma entrada como revisada; uma entrada já revisada SHALL mostrar um selo em vez do botão de revisão.

#### Scenario: Lista ordenada e com busca

- **WHEN** o SUPER_ADMIN abre a tela de Catálogo Global
- **THEN** vê a entrada mais recente primeiro, e pode filtrar digitando um nome ou código de barras

#### Scenario: Corrigir uma entrada

- **WHEN** o SUPER_ADMIN clica em "Editar", altera o nome (e opcionalmente a marca) e salva
- **THEN** a correção é enviada ao back e a lista reflete o novo nome

#### Scenario: Marcar como revisada

- **WHEN** o SUPER_ADMIN clica em "Marcar revisado" numa entrada
- **THEN** a entrada passa a mostrar um selo "Revisado" no lugar do botão

### Requirement: Métrica de uso do catálogo global no Resumo

O Resumo do SaaS SHALL exibir a métrica de uso do catálogo global (total de produtos, total de reaproveitamentos, quantas lojas reaproveitaram, quantas entradas aguardam revisão) e um link para a tela de Catálogo Global.

#### Scenario: Métricas visíveis no Resumo

- **WHEN** o SUPER_ADMIN abre o Resumo do SaaS
- **THEN** vê as métricas do catálogo global e um link para revisar
