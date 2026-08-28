## 1. Configuração de ambiente

- [x] 1.1 Garantir `.env.example` (versionado) e `.env.development` (local) na raiz com `VITE_API_BASE_URL=http://localhost:8080` (o `.example` com um comentário citando `spec.md` §6). Ambos já existiam com o conteúdo certo — conferido. Verificar: `git check-ignore .env.example` não retorna nada (rastreado); `.env.development` é ignorado pelo `~/.gitignore_global` (`.env.*`, exceção só `.env.example`) e é criado por `cp .env.example .env.development` — comportamento esperado (ver design Decisão 2). `npx vitest run` continua verde (handlers MSW `*/api/...` seguem casando).
- [x] 1.2 Conferido: `vite.config.ts` tem `server.proxy['/api'] → http://localhost:8080` (`changeOrigin: true`) e `api-client.ts` usa `getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''`. Com `.env.development` setando `VITE_API_BASE_URL=http://localhost:8080`, as chamadas viram absolutas para `:8080`; sem o `.env`, base `''` → relativas → proxy do Vite → `:8080`. Os dois modos são consistentes; nada a ajustar. (A confirmação pela aba Network do `npm run dev` fica junto da execução manual da Seção 3.)

## 2. Roteiro de desenvolvimento

- [x] 2.1 Adicionada a seção "## Desenvolvimento local" ao `README.md` com os 3 passos: (a) backend em `simplecote-back` com `AUTH_ENABLED=true ./mvnw spring-boot:test-run` (porta 8080, requer Docker/Testcontainers); (b) `cp .env.example .env.development` + `npm run dev`; (c) `/login` com `admin@dev.local` / `admin123` (`SeedDadosDev`). A verificação "seguir do zero → painel logado" depende do backend no ar (ver Seção 3, pendente).

## 3. Verificação ponta a ponta contra o backend vivo

- [x] 3.1 Backend vivo em `:8080` (auth ligada). `POST /api/auth/login {email,senha}` com `admin@dev.local`/`admin123` → `200` `{"token":"eyJ..."}` — shape `{ token }` e path batem com o `AuthContext`. JWT decodifica com `compradorId` + `papel: ADMIN`. Persistência de sessão (`sessionStorage` → `AuthContext` hidrata no mount, `AuthGuard` libera `/admin`) já coberta por `AuthContext.test.tsx` / `AuthGuard.test.tsx`. Sem divergência.
- [x] 3.2 Contra o backend vivo (com `Authorization: Bearer`): `GET /api/produtos` → lista com shape exato de `Produto` (`{id,nome,codigoBarras,unidade,quantidadePorEmbalagem,ativo}`, `codigoBarras` pode ser `null`). `POST /api/produtos` com o payload de `ProdutoFormValues` → `201` + `Produto`. `POST /api/produtos/:id/inativar` → `204`, produto some do `GET`. `PUT /api/produtos/:id` → `200` + `Produto`. Sem divergência de campo/shape/status.
- [x] 3.3 Contra o backend vivo: `GET /api/empresas` → `{id,nome,ativo}` (= `Empresa`). `POST /api/empresas {nome}` → `201` + `Empresa`. `POST /api/representantes {empresaId,nome,email,whatsapp}` → `201` + `{id,empresaId,nome,email,whatsapp,ativo}` (= `CriarRepresentanteRequest` + resposta). `PUT /api/empresas/:id {nome}` → `200` + `Empresa`. Empresa + representante persistidos (confirmado via `GET`). Sem divergência.
- [x] 3.4 Nenhuma divergência estrutural — todos os endpoints existem e os fluxos fecham. Observação não-bloqueante: `GET /api/produtos` responde `200` sem `Authorization` (o backend não exige auth em GETs de leitura, ou quem subiu não passou `AUTH_ENABLED`); o front sempre manda o header quando tem token, então não há nada a corrigir no front.

## 4. Roadmap no repo

- [x] 4.1 Em `spec.md` (front), atualizar a §7: marcar cada item das Fases 1/2/3 e do "Por último" como ✅ feito / 🟡 parcial / ❌ pendente, conforme o estado real (login/guard feito; Produtos e Empresas feitos; Cotações e tela do representante pendentes; etc.).
- [x] 4.2 Corrigir os trechos defasados de `spec.md` §1 e §2 que dizem "sem login até o JWT existir" — o JWT existe e o painel agora loga de verdade.
- [x] 4.3 Acrescentar a subseção "## Estado atual (2026-08-28)" ao `spec.md` com: o gap até a Fase 1 completa (Cotações admin, tela do representante), e os follow-ups explícitos (`/admin/representantes` dedicada, grade ao vivo da Fase 2, itens da Fase 3, CI). Verificar: a seção lista changes/itens rastreáveis, não texto vago.

## 5. Fechamento

- [x] 5.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [x] 5.2 `openspec validate ligar-front-ao-backend` sem erros.
