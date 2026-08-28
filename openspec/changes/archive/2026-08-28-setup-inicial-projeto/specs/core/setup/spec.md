## Purpose

Estabelece a fundação do aplicativo front-end, incluindo roteamento, chamadas de rede e injeção de dependências para as demais funcionalidades.

## ADDED Requirements

### Requirement: Inicialização do cliente HTTP base
O sistema MUST configurar um cliente HTTP centralizado capaz de resolver a URL base do backend usando variáveis de ambiente e processar automaticamente respostas de erro no padrão `ProblemDetail`.

#### Scenario: Interceptação de erro da API
- **WHEN** uma requisição de domínio retorna erro e o payload é um formato `ProblemDetail` válido
- **THEN** o cliente HTTP intercepta e traduz o erro num formato amigável ao usuário sem quebrar o fluxo da aplicação

### Requirement: Estrutura de roteamento dual
O sistema SHALL implementar duas árvores de rota separadas: uma para o painel de administradores e uma pública (por token) para representantes. 

#### Scenario: Rota do painel de administração
- **WHEN** o usuário acessa `/admin`
- **THEN** o sistema exibe o layout base do admin (AdminLayout, Sidebar)

#### Scenario: Rota do representante
- **WHEN** o usuário acessa `/cotacao/:token`
- **THEN** o sistema carrega a tela independente de respostas do representante sem exibir a barra de navegação do admin
