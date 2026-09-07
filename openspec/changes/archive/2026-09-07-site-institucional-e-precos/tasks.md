## 1. Layout e conteúdo

- [x] 1.1 `src/site/SiteLayout.tsx`: cabeçalho (logo, links para preços/ajuda, "Entrar", "Criar conta") + rodapé (links + crédito de desenvolvedor de `src/shared/creditos-desenvolvedor.ts`)
- [x] 1.2 `src/site/planos.ts`: fonte única da descrição dos planos e quotas; exportada para uso também em `admin/cobranca`
- [x] 1.3 `src/site/HomePage.tsx`: o que é / como funciona / telas (`src/assets/hero.png`) / CTAs "Criar conta" e "Entrar"
- [x] 1.4 `src/site/PrecosPage.tsx`: planos de `planos.ts` + CTA para `/cadastro`
- [x] 1.5 `src/site/AjudaPage.tsx`: renderiza o FAQ de `src/admin/ajuda/faq.ts`

## 2. Rotas

- [x] 2.1 `src/routes.tsx`: `/`, `/precos`, `/ajuda` com `SiteLayout` (páginas lazy), públicas
- [x] 2.2 `/`: com sessão → `Navigate` para `/admin`; sem sessão em subdomínio de loja → `/login`; sem sessão em host neutro/marketing → `HomePage`; enquanto `AuthContext.carregando` → `RouteLoadingFallback` (componente `src/site/Raiz.tsx`)
- [x] 2.3 `*`: `Navigate` para `/` — sem sessão cai na home (ou login da loja), com sessão vai para `/admin`

## 3. SEO básico

- [x] 3.1 `src/site/seo.ts` (`useSEO`) define `<title>` e `<meta name="description">` por página do site
- [x] 3.2 `public/robots.txt` e `public/sitemap.xml` com as rotas públicas
- [x] 3.3 `index.html`: descrição e Open Graph mínimos

## 4. Testes

- [x] 4.1 `/` sem sessão renderiza a home com os CTAs "Criar conta" e "Entrar"
- [x] 4.2 `/` com sessão redireciona para `/admin`
- [x] 4.3 `/precos` lista os planos vindos de `planos.ts`
- [x] 4.4 `/ajuda` renderiza as entradas do FAQ
- [x] 4.5 `*` sem sessão cai na home

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual: abrir `/` numa aba anônima, navegar site → `/cadastro` → voltar; logar e confirmar que `/` vai para `/admin`
