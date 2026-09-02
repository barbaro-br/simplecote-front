## ADDED Requirements

### Requirement: Escolher estilo de navegação

A tela de Configurações SHALL permitir escolher o estilo de navegação do painel entre `Lateral` (sidebar, padrão atual) e `Inferior` (barra fixa na parte de baixo da tela), persistindo a escolha via API. O estilo escolhido SHALL se aplicar em todas as rotas `/admin/**` para todos os usuários dessa loja (não é uma preferência por usuário).

#### Scenario: Trocar para estilo inferior

- **WHEN** o admin seleciona "Inferior" nas Configurações e salva
- **THEN** o painel passa a exibir a navegação como barra fixa na parte inferior da tela em todas as rotas

#### Scenario: Trocar de volta para lateral

- **WHEN** o admin seleciona "Lateral" nas Configurações e salva
- **THEN** o painel volta a exibir a sidebar lateral, com o comportamento de expandir/recolher já existente
