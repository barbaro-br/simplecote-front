## Why

Apesar da estabilidade das regras de negócio do SimpleCote, a experiência visual e interativa de algumas telas chave (como a Grade ao Vivo e os componentes de ação) ainda apresenta um aspecto funcional, mas pouco inovador. O objetivo desta mudança é aplicar conceitos modernos de UI/UX (animações sutis, microinterações, feedbacks visuais, esqueletos de carregamento mais polidos) para fazer o sistema "brilhar aos olhos do cliente". Além disso, busca-se otimizar a sensação de reatividade da UI durante as atualizações em tempo real (via SSE), utilizando ferramentas modernas sem alterar a lógica de negócios e as regras de apuração estabelecidas no back-end.

## What Changes

- **Modernização de Ícones e Ações Rápidas**: Atualização da iconografia e botões de ação atuais com suporte a *tooltips* animados e *hover states* com feedback tátil/visual imediato para ações como "Copiar", "WhatsApp" e "Email".
- **Aperfeiçoamento da Grade ao Vivo (Live Grid)**: 
  - Melhoria na percepção visual dos preços ao vivo. O sistema já utiliza **Server-Sent Events (SSE)** para atualizar os preços instantaneamente sem recarregar a página. Nós introduziremos transições/animações CSS para realçar a entrada desses novos preços na tela (ex: *flash highlight* sutil ao atualizar um valor).
  - Ajustes de tipografia e espaçamento para tornar os números e status (Vencedor/Empate) mais legíveis e com destaque hierárquico.
- **Microinterações e Polimento UI**: Refinamento de bordas, sombras (elevação), e estados de carregamento (Skeleton screens) substituindo os *spinners* básicos em áreas de grande densidade de dados.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin/cotacoes`: Requisitos de exibição e interação visual do painel de cotações e de seus subcomponentes modais repaginados com foco em microinterações.
- `admin/cotacoes-live-stream`: Aprimoramento da performance perceptual e feedbacks visuais da Grade ao Vivo, especificando transições e animações visuais conectadas aos eventos SSE.

## Impact

- Código afetado: Componentes do Design System em `src/shared/components/ui`, componentes de cotação em `src/admin/cotacoes/` (como a Grade ao Vivo e os cards de representantes).
- Dependências: Apenas Tailwind nativo para as transições, sem adição de bibliotecas pesadas.
- Contrato da API / Backend: Nenhum. O hook `useGradeAoVivoSSE` já existe e está funcional, apenas "escutaremos" essas atualizações para acionar os efeitos visuais.
