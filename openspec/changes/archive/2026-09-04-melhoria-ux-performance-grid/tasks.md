## 1. Design System e Base UI

- [x] 1.1 Atualizar ou criar o componente genérico de Skeleton (`src/shared/components/ui/skeleton.tsx` ou equivalente) usando classes utilitárias do Tailwind (`animate-pulse`) e verificar se renderiza corretamente em isolamento.
- [x] 1.2 Implementar ou aprimorar o componente de Tooltip animado em `src/shared/components/ui/` suportando propriedades de delay e animação nativa CSS, verificando seu comportamento de fade-in no hover.

## 2. Aprimoramento de Ícones e Ações Rápidas

- [x] 2.1 Refatorar os botões de ação na lista e modais de Cotações (Copiar Link, Email, WhatsApp) para utilizar o novo Tooltip e adicionar feedback de *hover* (*hover:bg-gray-100*, *scale* leve) validando a responsividade e transições no navegador.
- [x] 2.2 Substituir *spinners* de carregamento nos modais de participantes ou listagem primária pelas versões compostas de Skeleton (`CardSkeleton` ou `RowSkeleton`) criadas na fase 1 e validar visualmente forçando um atraso de rede.

## 3. Microinterações na Grade ao Vivo

- [x] 3.1 Criar o hook customizado `useHighlightOnUpdate` (ou equivalente em `src/shared/hooks/`) que compara valores anteriores e dispara temporariamente uma classe CSS (ex: `bg-green-100/50 transition-colors duration-700`) quando o valor muda. Verificar através de testes unitários ou uso simulado.
- [x] 3.2 Integrar o hook de highlight nas células de preço (`PriceCell`) da Grade ao Vivo (`src/admin/cotacoes/`), garantindo que o flash ocorra tanto para novas ofertas (`COTADO`) quanto para mudanças de liderança (Menor Preço) sem afetar a performance, e validar disparando atualizações simuladas ou via MSW.

## 4. Testes e Validação Final

- [x] 4.1 Rodar a suíte de testes de UI e integração para garantir que as animações/classes dinâmicas não quebram asserções existentes (`npm test`).
- [x] 4.2 Executar checagem de saúde (`npm run lint`, `npm run build`) para assegurar estabilidade estrutural após a refatoração visual.
