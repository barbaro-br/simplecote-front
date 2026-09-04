## ADDED Requirements

### Requirement: Componente padronizado de mensagem de erro

Mensagens de erro de ação (falha ao excluir, cancelar, ou qualquer operação disparada pelo usuário que a API rejeite) SHALL usar um componente compartilhado de alerta com fundo (`bg-destructive/10`), borda (`border-destructive/30`) e ícone de alerta — não texto solto sem contorno visual. `CotacoesPage` (lista de Cotações) e `CotacaoDetalhePage` (detalhe da Cotação) SHALL usar esse componente compartilhado para suas mensagens de erro de ação.

#### Scenario: Erro de ação na lista de Cotações usa o alerta padronizado

- **WHEN** uma ação na lista de Cotações (ex.: excluir) falha e a API retorna erro
- **THEN** a mensagem de erro aparece dentro do componente de alerta padronizado (fundo, borda, ícone), não como texto solto

#### Scenario: Erro de ação no detalhe da Cotação usa o alerta padronizado

- **WHEN** uma ação na tela de detalhe da Cotação falha e a API retorna erro
- **THEN** a mensagem de erro aparece dentro do componente de alerta padronizado (fundo, borda, ícone), não como texto solto
