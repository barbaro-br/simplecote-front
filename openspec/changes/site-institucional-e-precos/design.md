## Context

Ver `proposal.md` — Why. `routes.tsx` hoje: `/` e `*` → `Navigate to /admin`. Há três árvores de rota depois das changes anteriores (`/admin/**`, público por token, `/backoffice/**`); o site é conteúdo público sem token.

## Goals / Non-Goals

**Goals**
- Uma home que converte visitante em cadastro, sem virar um CMS.
- Preços que nunca divergem da cobrança real.

**Non-Goals**
- Blog / CMS / i18n / A-B testing — não agora.
- Domínio custom por cliente (`compras.mercadodoze.com.br`) — é feature paga de outra frente.
- Design final / copy definitiva — a change entrega a estrutura e os CTAs; o conteúdo é iterável.

## Decisions

- **Mesmo projeto Vercel, não um separado — por ora.** Adicionar `/`, `/precos`, `/ajuda` ao app existente é o caminho mais curto e o `vercel.json` (SPA fallback) já cobre. Alternativa considerada: projeto Vercel separado servindo `simplecote.com.br` com rewrite de `/app` para este. Vale quando o site ganhar time/cadência de marketing próprios; até lá, um bundle só. O `SiteLayout` isola o código para facilitar a extração futura.
- **`/` condicional em vez de rota nova para a landing.** Manter a URL raiz como a home pública (bom para SEO e para o CTA) e redirecionar quando há sessão. Alternativa (`/site` ou `/home`) foi rejeitada: a raiz é o ativo de marketing.
- **Destino do redirect depende de `tenant-por-subdominio`.** Com subdomínios ativos, `/` no apex/`www` (`.com.br`) com sessão manda para `<slug>.simplecote.app` (host da app, TLD diferente do site); sem eles, mantém o `Navigate to /admin` atual. O `SiteLayout` só vive no host do site; o app não renderiza o site.
- **Planos numa fonte única local (`src/site/planos.ts`), importada também por `admin/cobranca`.** Evita a page de preços dizer uma coisa e a tela de assinatura outra. Se um dia os planos vierem do back, esse módulo vira o fetch — um ponto de mudança.
- **FAQ reaproveitado de `admin/ajuda/faq.ts`.** Uma fonte de verdade para ajuda, renderizada em dois lugares (botão flutuante e `/ajuda`).

## Risks / Trade-offs

- **Bundle do app cresce com páginas que o usuário logado nunca vê** → as rotas do site entram por `lazy()` como as do painel; custo desprezível.
- **`/` condicional pode piscar** (decидe logado/deslogado após o boot) → reusar o estado `carregando` do `AuthContext` (change `sessao-longa-com-refresh-token`): enquanto carrega, mostrar o `RouteLoadingFallback`, depois decidir.
- **SEO num SPA** → título/meta por página e `sitemap.xml`/`robots.txt` estáticos cobrem o básico; SSR/prerender fica para se a aquisição orgânica virar prioridade.

## Migration Plan

1. Adicionar `src/site/` e as rotas; `/` passa a checar sessão.
2. Ajustar o `*` para cair na home quando sem sessão.
3. Rollback: reverter `routes.tsx` para os dois `Navigate to /admin`.
