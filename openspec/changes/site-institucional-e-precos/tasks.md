## 1. Layout e conteúdo

- [ ] 1.1 `src/site/SiteLayout.tsx`: cabeçalho (logo, links para preços/ajuda, "Entrar", "Criar conta") + rodapé (links + crédito de desenvolvedor de `src/shared/creditos-desenvolvedor.ts`)
- [ ] 1.2 `src/site/planos.ts`: fonte única da descrição dos planos e quotas; exportada para uso também em `admin/cobranca`
- [ ] 1.3 `src/site/HomePage.tsx`: o que é / como funciona / telas (`src/assets/hero.png`) / CTAs "Criar conta" e "Entrar"
- [ ] 1.4 `src/site/PrecosPage.tsx`: planos de `planos.ts` + CTA para `/cadastro`
- [ ] 1.5 `src/site/AjudaPage.tsx`: renderiza o FAQ de `src/admin/ajuda/faq.ts`

## 2. Rotas

- [ ] 2.1 `src/routes.tsx`: `/`, `/precos`, `/ajuda` com `SiteLayout` (lazy), públicas
- [ ] 2.2 `/`: com sessão → `Navigate` para `/admin`; sem sessão → `HomePage`; enquanto `AuthContext.carregando` → `RouteLoadingFallback`
- [ ] 2.3 `*`: sem sessão → home pública; com sessão → `/admin` (comportamento atual)

## 3. SEO básico

- [ ] 3.1 `<title>` e `<meta name="description">` por página do site
- [ ] 3.2 `public/robots.txt` e `public/sitemap.xml` com as rotas públicas
- [ ] 3.3 `index.html`: descrição e Open Graph mínimos

## 4. Testes

- [ ] 4.1 `/` sem sessão renderiza a home com os CTAs "Criar conta" e "Entrar"
- [ ] 4.2 `/` com sessão redireciona para `/admin`
- [ ] 4.3 `/precos` lista os planos vindos de `planos.ts`
- [ ] 4.4 `/ajuda` renderiza as entradas do FAQ
- [ ] 4.5 `*` sem sessão cai na home

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual: abrir `/` numa aba anônima, navegar site → `/cadastro` → voltar; logar e confirmar que `/` vai para `/admin`
