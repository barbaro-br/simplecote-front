## Why

Hoje `/` só redireciona para `/admin` e `*` também — não existe uma página pública que explique o que é o SimpleCote nem quanto custa. Para um SaaS de auto-cadastro, essa é a porta de entrada: quem chega pelo Google ou por indicação precisa entender o produto, ver os planos e ter um caminho óbvio para "criar conta" (`cadastro-publico-self-service`) ou "entrar".

## What Changes

- **Página inicial pública** em `/` para visitantes sem sessão: o que o SimpleCote faz (cotação competitiva / leilão reverso para supermercados), como funciona em poucos passos, prova social/telas, e chamadas para **"Criar conta"** (`/cadastro`) e **"Entrar"** (`/login`). Visitante **com sessão** ativa em `/` continua indo para `/admin`.
- **Página de preços** em `/precos`: os planos, o que cada um inclui (as mesmas quotas de `planos-e-cobranca`), e o CTA para `/cadastro`. Os números dos planos vêm de uma fonte única para não divergir da cobrança real.
- **Central de ajuda pública** em `/ajuda`: expande o conteúdo hoje preso no `BotaoAjudaFlutuante` + `faq.ts` para uma página navegável e indexável.
- Rodapé comum às páginas públicas com links (preços, ajuda, entrar, criar conta) e o crédito de desenvolvedor já existente.
- O `*` (rota desconhecida) para visitante sem sessão passa a levar à página inicial, não a `/admin`.

## Capabilities

### Added Capabilities

- `site`: site institucional público do SimpleCote — página inicial, preços e central de ajuda, com os caminhos para criar conta e entrar.

## Impact

- Novo `src/site/`: `HomePage.tsx`, `PrecosPage.tsx`, `AjudaPage.tsx`, `SiteLayout.tsx` (cabeçalho + rodapé públicos), `planos.ts` (fonte única da descrição dos planos, compartilhada com `admin/cobranca`).
- `src/routes.tsx`: `/`, `/precos`, `/ajuda` públicas com `SiteLayout`; `/` com sessão redireciona **para `<slug>.simplecote.app`** (quando `tenant-por-subdominio` estiver ativo) ou para `/admin` (enquanto não estiver); ajustar o `*`.
- Hosts: o site institucional fica no apex `simplecote.com.br` + `www`; o app autenticado, em `<slug>.simplecote.app` (e `app.simplecote.app` como host neutro). Ver `RISCOS-TRANSVERSAIS.md` §0 e `tenant-por-subdominio`.
- Reuso: `src/admin/ajuda/faq.ts`, `src/shared/creditos-desenvolvedor.ts`, `src/assets/hero.png`.
- SEO básico: `<title>`/meta por página, `index.html` com descrição, `sitemap.xml`/`robots.txt` em `public/`.
- Testes: `/` sem sessão mostra a home com CTAs; `/` com sessão redireciona para `/admin`; `/precos` lista os planos da fonte única; `/ajuda` renderiza o FAQ; `*` sem sessão cai na home.
- **Sem contrato novo com o back** (conteúdo estático). Se os planos forem servidos por API no futuro, `planos.ts` vira a chamada; por ora é local e compartilhado.
- **Deploy**: continua um único projeto Vercel/`dist` (as rotas do site convivem com o app). Extrair para um projeto separado é possível depois via rewrites — anotado no design, fora do escopo aqui.
