## Why

O app não tem nenhuma divisão de bundle por rota — todo o código (painel admin: tabelas, grade ao vivo, gráficos de análise; e as telas públicas mobile-first: colaborador, representante) sai num único `index-*.js` (~980KB minificado). O uso real é assimétrico: o admin acessa quase sempre pelo desktop (banda/CPU não são o gargalo), enquanto colaborador e representante abrem o link no celular, no chão de loja, onde o tamanho do bundle importa de verdade. Hoje o celular do colaborador baixa o painel admin inteiro só para mostrar uma tela simples de busca/bipagem de item.

## What Changes

- `src/routes.tsx` passa a carregar os componentes de rota via `React.lazy()`, agrupados por área: **admin** (`/admin/**`, tudo atrás do `AuthGuard`) num grupo, **público mobile** (`/colaborador/:token`, `/cotacao/:token`, `/pedido/:token`) em outro, e **login/recuperação de senha** (pequenas, ficam no chunk principal — sem necessidade de lazy).
- Um `<Suspense>` com fallback simples (skeleton/spinner) envolve o `<RouterProvider>` (ou cada grupo de rota), cobrindo o carregamento do chunk na primeira navegação para uma área ainda não baixada.
- Módulos usados por múltiplas áreas (`shared/api/api-client.ts`, `shared/auth/**`, componentes de UI compartilhados) continuam num chunk comum, carregado sempre — só o código *exclusivo* de cada área (tabelas/gráficos do admin; `@zxing/browser` do colaborador) sai do caminho crítico da outra área.
- **Sem mudança de comportamento funcional**: mesmas rotas, mesmos dados, mesma navegação — só muda como o JS chega ao navegador. Por isso esta change não altera nenhum requirement de spec (`skip_specs: true`); o único efeito observável é um possível flash de carregamento breve na primeira navegação para uma área ainda não baixada.

## Capabilities

### New Capabilities

(nenhuma — mudança de build/performance, sem capability de produto)

### Modified Capabilities

(nenhuma — ver nota de `skip_specs` acima)

## Impact

- `src/routes.tsx`: imports estáticos das páginas de rota viram `React.lazy(() => import(...))`.
- Arquivo de entrada (`src/main.tsx` ou onde o `<RouterProvider>` é renderizado): envolver com `<Suspense fallback={...}>`.
- `.github/workflows/deploy.yml`: o smoke test pós-deploy procura o bundle `/assets/index-[A-Za-z0-9_-]+\.js` publicado e confere se ele contém a URL do back (`VITE_API_BASE_URL`). Preciso verificar, depois do build local, se o `api-client.ts` (que usa essa env var) continua caindo no chunk principal (`index-*.js`) ou se migra para um chunk com outro prefixo — se migrar, o regex do smoke test precisa ser ajustado junto nesta mesma change.
- Sem mudança de dependência, sem mudança de contrato de API, sem impacto no back (confirmado: é só reorganização de build do front — ver troca anterior com o usuário).
- Testes: nenhum teste de comportamento deveria mudar (mesmas telas, mesmos dados); só é preciso confirmar que os testes de rota/navegação existentes não dependem de os componentes estarem disponíveis de forma síncrona (sem `Suspense`) — ajustar para `findBy*`/`waitFor` onde necessário, mesmo padrão já usado em `ColaboradorPage.test.tsx` ao lazy-carregar `LeitorCodigoBarras`.
