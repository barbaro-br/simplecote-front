## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Papel `SUPER_ADMIN` no `Usuario` (com `comprador_id` nulo); seed do primeiro
- [ ] 0.2 Controller `/api/admin/compradores` fora do filtro de inquilino, protegido só para `SUPER_ADMIN`: listar, detalhar, suspender, reativar, resetar senha de admin
- [ ] 0.3 Emissão de token de suporte: JWT com `comprador_id` do alvo + claim `impersonatedBy` + `exp` curto; trilha de auditoria de toda ação sob impersonação

## 1. Sessão e papel

- [x] 1.1 `src/shared/domain/papel.ts` ganhou `SUPER_ADMIN` (type `Papel` + `ROTULO_PAPEL`); `src/shared/auth/jwt.ts` decodifica `impersonatedBy`; `AuthContext`/`useAuth` expõem `papel` e `modoSuporte`
- [x] 1.2 `AuthContext` guarda o token de SUPER_ADMIN em memória ao `entrarComoSuporte` e restaura no `sairModoSuporte`

## 2. Guarda e rotas

- [x] 2.1 `src/backoffice/BackofficeGuard.tsx`: exige sessão + `SUPER_ADMIN`; caso contrário renderiza "não encontrado"
- [x] 2.2 `src/routes.tsx`: árvore `/backoffice/**` (`BackofficeGuard` → `BackofficeLayout`) sem `AdminLayout`/`TemaClaro`

## 3. Telas do backoffice

- [x] 3.1 `backoffice.schema.ts` + `backoffice.api.ts`: `useCompradores({ status, busca })`, `useComprador(id)` (detalhe com `admins`), mutações suspender/reativar/resetar-senha, `useEntrarComoSuporte`
- [x] 3.2 `CompradoresPage.tsx`: tabela (nome, slug, status, criação, último acesso, uso), filtro por status com inadimplentes destacados, busca por nome/e-mail; estados carregando/vazio/erro
- [x] 3.3 `CompradorDetalhePage.tsx`: dados + seção "Administradores" + ações (suspender/reativar/resetar-senha) com `ConfirmarDialog`; erro do backend na tela

## 4. Modo suporte

- [x] 4.1 "Entrar como suporte": diálogo com motivo obrigatório → `POST .../suporte` → guarda o token de SUPER_ADMIN → `entrarComoSuporte(token)` → navega `/admin`
- [x] 4.2 `ModoSuporteBanner.tsx` no topo do `AdminLayout`: tarja "Modo suporte — <comprador>" + "sair do modo suporte" (restaura a sessão de `SUPER_ADMIN` e volta a `/backoffice`)

## 5. Testes

- [x] 5.1 `BackofficeGuard`: sem `SUPER_ADMIN` → "não encontrado"; com → lista
- [x] 5.2 `CompradoresPage`: filtro por status e busca por e-mail
- [x] 5.3 `CompradorDetalhePage`: suspender/resetar chamam a API após confirmação; erro do backend aparece
- [x] 5.4 Impersonação: motivo obrigatório; sucesso troca a sessão, navega para `/admin` e mostra a tarja; "sair do modo suporte" restaura

## 6. Checagem de saúde

- [x] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual com o back: logar como `SUPER_ADMIN`, listar/filtrar, suspender e reativar uma conta de teste, entrar como suporte e sair
