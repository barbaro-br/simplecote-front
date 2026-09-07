## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Papel `SUPER_ADMIN` no `Usuario` (com `comprador_id` nulo); seed do primeiro
- [ ] 0.2 Controller `/api/admin/compradores` fora do filtro de inquilino, protegido só para `SUPER_ADMIN`: listar, detalhar, suspender, reativar, resetar senha de admin
- [ ] 0.3 Emissão de token de suporte: JWT com `comprador_id` do alvo + claim `impersonatedBy` + `exp` curto; trilha de auditoria de toda ação sob impersonação

## 1. Sessão e papel

- [ ] 1.1 `src/shared/auth/`: `AuthContext`/`useAuth` expõem `role` e `modoSuporte` (do claim `impersonatedBy`)
- [ ] 1.2 Guardar a sessão anterior ao iniciar impersonação, para restaurar

## 2. Guarda e rotas

- [ ] 2.1 `src/backoffice/BackofficeGuard.tsx`: exige sessão + `SUPER_ADMIN`; caso contrário renderiza "não encontrado"
- [ ] 2.2 `src/routes.tsx`: árvore `/backoffice/**` sem `AdminLayout`/`TemaClaro`

## 3. Telas do backoffice

- [ ] 3.1 `backoffice.schema.ts` + `backoffice.api.ts`: `useCompradores({ status, busca })`, `useComprador(id)`, mutações suspender/reativar/resetar-senha, `useEntrarComoSuporte(id, motivo)`
- [ ] 3.2 `CompradoresPage.tsx`: tabela (nome, plano, status, criação, último acesso, uso), filtro por status com inadimplentes destacados, busca por nome/e-mail; estados carregando/vazio/erro
- [ ] 3.3 `CompradorDetalhePage.tsx`: dados + ações com `ConfirmarDialog` nomeando a consequência; erro do backend na tela

## 4. Modo suporte

- [ ] 4.1 "Entrar como suporte": diálogo com campo de motivo obrigatório → troca a sessão pelo token de suporte → navega para `/admin`
- [ ] 4.2 `ModoSuporteBanner.tsx` no `AdminLayout`: tarja permanente "Modo suporte — <comprador>" + botão "sair do modo suporte" (restaura a sessão de `SUPER_ADMIN`)

## 5. Testes

- [ ] 5.1 `BackofficeGuard`: sem `SUPER_ADMIN` → "não encontrado"; com → lista
- [ ] 5.2 `CompradoresPage`: filtro por status e busca por e-mail
- [ ] 5.3 `CompradorDetalhePage`: suspender/reativar/resetar chamam a API após confirmação; erro do backend aparece
- [ ] 5.4 Impersonação: motivo obrigatório; sucesso troca a sessão, navega para `/admin` e mostra a tarja; "sair do modo suporte" restaura

## 6. Checagem de saúde

- [ ] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual com o back: logar como `SUPER_ADMIN`, listar/filtrar, suspender e reativar uma conta de teste, entrar como suporte e sair
