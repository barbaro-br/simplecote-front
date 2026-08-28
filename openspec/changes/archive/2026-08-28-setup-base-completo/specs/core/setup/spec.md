## Purpose

Fornece o esqueleto inicial de navegação e integração de rede da aplicação (roteamento duplo e cliente HTTP).

## ADDED Requirements

### Requirement: Roteamento isolado por perfil
A aplicação MUST disponibilizar duas árvores de rota independentes: uma área de administração (`/admin/**`) com navegação global, e uma área pública de acesso via token (`/cotacao/:token` e `/pedido/:token`) desenhada primariamente para mobile.

#### Scenario: Acesso Admin
- **WHEN** o usuário acessa `/admin/produtos`
- **THEN** a interface exibe o shell do painel (sidebar, layout global) e o conteúdo da rota

#### Scenario: Acesso Representante
- **WHEN** o usuário acessa `/cotacao/abc-123`
- **THEN** a interface exibe apenas o formulário da cotação sem navegação lateral (shell minimalista)

### Requirement: Cliente HTTP unificado
Todo consumo de APIs REST MUST ocorrer através de um utilitário centralizado (`api-client`) que intercepte e normalize erros.

#### Scenario: Consumo com sucesso
- **WHEN** o componente dispara uma chamada `api.get`
- **THEN** o utilitário anexa configurações base e processa o retorno corretamente
