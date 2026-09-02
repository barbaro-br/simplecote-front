## Context

O shell do admin é o `AdminLayout` (`src/admin/layout/AdminLayout.tsx`): um flex container horizontal com a `<aside>` (sidebar) e um `<main className="flex-1 p-8 overflow-hidden">` que renderiza `<RouteTransition />` (que, por sua vez, renderiza o `Outlet` da rota). Como o `<main>` estica até a borda direita e não há nenhum wrapper interno com largura máxima/margem automática, o conteúdo das páginas fica alinhado à esquerda em viewports largos. O projeto usa Tailwind v4, então as utilities (`max-w-7xl`, `mx-auto`, `w-full`) estão disponíveis sem configuração adicional.

## Goals / Non-Goals

**Goals:**
- Centralizar o conteúdo das rotas `/admin/**` dentro da área útil, sem alterar o layout por tela.
- Preservar o comportamento atual da sidebar (colapsar/expandir, transição, persistência em `localStorage`).

**Non-Goals:**
- Não tocar na árvore do representante (`/cotacao/:token`, `/pedido/:token`), que é mobile-first com shell próprio (`TemaClaro`).
- Não alterar componentes de tela individuais (Dashboard, Cotações, Produtos).
- Nenhuma mudança de API, dependência ou dado.

## Decisions

### Onde aplicar a centralização

Aplicar a mudança **somente** no `AdminLayout`, dentro do `<main>`, adicionando um wrapper interno ao redor de `<RouteTransition />`. Não mexer tela a tela.

- **Alternativa considerada:** aplicar `max-w-7xl mx-auto` diretamente no `<main>`. Descartada porque faria o próprio `<main>` encolher para a largura máxima e deixar de ocupar todo o espaço restante ao lado da sidebar, mudando a estrutura de fundo/largura do container.

### Estrutura de classes

- `<main>` passa a ser `flex-1 overflow-hidden` (sem o `p-8`), continuando a ocupar todo o espaço restante ao lado da sidebar.
- Novo wrapper interno: `mx-auto w-full max-w-7xl p-8` envolvendo `<RouteTransition />`. `max-w-7xl` limita a largura (1280px), `mx-auto` centraliza, `w-full` garante preenchimento em viewports menores, e `p-8` preserva o padding lateral/vertical já existente.

- **Alternativa considerada:** `max-w-screen-xl` no lugar de `max-w-7xl`. Ambas resolvem para 1280px no Tailwind v4; `max-w-7xl` foi escolhida por ser a opção nomeada no pedido e equivalente em efeito.

## Risks / Trade-offs

- [Quebra do layout das telas que dependiam do `p-8` no `<main>`] → o padding foi movido para o wrapper interno, preservando o mesmo espaçamento visual.
- [Rolagem vertical sob `overflow-hidden`] → o wrapper interno é filho do `<main>` com `overflow-hidden`, então o comportamento de scroll atual é preservado; nenhuma mudança na árvore de scroll.
- [Sidebar colapsada deixar o conteúdo descentralizado] → como a centralização é relativa à área útil do `<main>` (que continua `flex-1`), o conteúdo permanece centralizado mesmo com a sidebar recolhida.
