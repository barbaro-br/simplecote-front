## Context

A UI atual depende fortemente de ícones estáticos e *spinners* clássicos. Para melhorar a percepção de resposta e adicionar um "brilho" na aplicação, vamos incorporar animações sutis. A Grade ao Vivo já se conecta à API via `EventSource` (SSE - Server-Sent Events) através do hook `useGradeAoVivoSSE`, e o TanStack Query refaz a chamada perfeitamente nos bastidores, porém o usuário não percebe visualmente *quais* células atualizaram.

## Goals / Non-Goals

**Goals:**
- Implementar microinterações em botões e tooltips sem prejudicar o tempo de carregamento da aplicação.
- Realçar visualmente as atualizações de preços instantâneas (flash effect) atreladas aos eventos SSE.
- Padronizar o uso de Skeleton Screens para os painéis primários.

**Non-Goals:**
- Alterar as bibliotecas base do projeto (`react-query`, `lucide-react`, `tailwind v4`).
- Modificar o backend (a API de SSE atual já funciona perfeitamente).

## Decisions

**1. Ferramenta de Animação: Tailwind CSS (Nativo)**
Para manter a dependência do projeto sob controle (já usamos Tailwind v4), a maioria dos *hover states*, transições de tooltips e animações de Skeleton será feita usando as classes utilitárias de transição e animação (`transition-all`, `duration-200`, `animate-pulse`, etc.). O *flash* temporário nas células de preços utilizará uma animação customizada do Tailwind (`@keyframes` ou class swapping dinâmico através do React).

**2. Implementação do Highlight (Flash) na Grade ao Vivo**
Usaremos um *hook* customizado (`useHighlightOnUpdate` ou comparador de ref) nas células da grade que observa a mudança da propriedade `preco`. Quando o novo valor for diferente do anterior (não-nulo, engatilhado pela refetch do SSE), injetaremos temporariamente (usando setTimeout de ~800ms) uma classe de highlight (ex: `bg-green-100 dark:bg-green-900`) e voltaremos para o estado transparente suavemente através da propriedade `transition-colors`.

**3. Skeleton Componentes**
Vamos padronizar um componente base de `<Skeleton />` estilizado via Tailwind (`animate-pulse bg-gray-200/50`) e compor esqueletos que imitam os componentes reais (ex: `CotacaoRowSkeleton`, `CardRepresentanteSkeleton`), removendo renderizações de spinners gigantescos no centro da tela.

## Risks / Trade-offs

- **Risk**: Poluição visual. Muitos flashes simultâneos podem ser cansativos na grade. 
- **Mitigation**: A animação de *flash* deve ser sutil (verde ou amarelo claro, durando menos de 1s, suavizando a saída).

- **Risk**: Re-renderizações excessivas em grandes cotações (Grade pesada).
- **Mitigation**: Certificar que o *highlight effect* fica isolado no componente de menor nível possível (`Cell` ou `PriceBadge`) usando `React.memo` para não disparar re-render de toda a tabela.
