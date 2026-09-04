## ADDED Requirements

### Requirement: Seleção de tema claro/escuro

O sistema SHALL permitir alternar entre o tema claro (padrão) e o tema escuro (`.dark`, já especificado em tokens CSS) via configuração persistida por Comprador (`tema`, `CLARO`/`ESCURO`), aplicada em todas as rotas `/admin/**` para todos os usuários dessa loja — não é uma preferência por usuário. A aplicação SHALL ocorrer num único ponto de bootstrap (`ConfiguracaoLojaProvider`), alternando a classe `dark` no elemento raiz do documento.

#### Scenario: Tema escuro aplicado a todas as rotas

- **WHEN** a configuração do Comprador tem `tema: 'ESCURO'`
- **THEN** todas as rotas `/admin/**` exibem os tokens de cor do tema escuro, para qualquer usuário dessa loja

#### Scenario: Tema claro é o padrão

- **WHEN** a configuração do Comprador não define `tema` explicitamente (Comprador novo)
- **THEN** o painel exibe o tema claro
