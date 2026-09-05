## ADDED Requirements

### Requirement: Microinterações em ações rápidas
Os botões de ações rápidas no painel de cotações e modais associados SHALL exibir *tooltips* informativos com transições suaves e possuir um estado de *hover* que ofereça feedback visual/tátil imediato (como alteração sutil de fundo ou elevação), sem alterar a funcionalidade da ação.

#### Scenario: Interação com botões de ação
- **WHEN** o usuário posiciona o cursor sobre os ícones de ação rápida (Copiar Link, WhatsApp, Email, etc.)
- **THEN** o sistema exibe um tooltip explicativo instantâneo com uma animação suave de entrada, e o ícone apresenta feedback visual imediato

### Requirement: Esqueletos de carregamento (Skeleton Screens)
Durante o carregamento de dados estruturados (listas, tabelas e modais densos), o sistema SHALL exibir estruturas de *skeleton* animadas no formato do conteúdo esperado, substituindo *spinners* circulares básicos para melhorar a percepção de tempo de resposta.

#### Scenario: Carregamento inicial de lista
- **WHEN** o usuário acessa uma página ou modal que depende de carregamento de dados
- **THEN** o sistema mostra um layout de *skeleton* cintilante (*shimmer effect*) até que os dados sejam completamente renderizados
