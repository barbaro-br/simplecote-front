## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Papel `OWNER` (um por `Comprador`; backfill nos existentes); `role` no JWT
- [ ] 0.2 `GET /api/organizacao/membros`
- [ ] 0.3 `POST /api/organizacao/convites` (e-mail + papel) + e-mail de convite; reenviar; revogar
- [ ] 0.4 `GET /api/organizacao/convites/:token` (contexto) e `POST` (aceitar definindo senha)
- [ ] 0.5 Inativar/remover membro (barrando o `OWNER`)
- [ ] 0.6 Enforcement de papel nas rotas sensíveis (`/api/organizacao/**`, `/api/assinatura`)

## 1. Papel na sessão

- [ ] 1.1 `src/shared/auth/`: `useAuth` expõe `role`; helper `podeVer('membros' | 'cobranca')`

## 2. Gestão de membros

- [ ] 2.1 `src/admin/organizacao/organizacao.schema.ts` + `organizacao.api.ts`
- [ ] 2.2 `MembrosPage.tsx`: lista (nome, e-mail, papel, status); estados carregando/vazio/erro
- [ ] 2.3 `ConvidarMembroDialog.tsx`: e-mail + papel (`ADMIN`/`OPERADOR`); erro do backend no formulário
- [ ] 2.4 Ações: reenviar e revogar convite; inativar/remover membro com `ConfirmarDialog`; `OWNER` sem essas ações
- [ ] 2.5 `src/routes.tsx`: `/admin/membros` (autenticada)

## 3. Aceite de convite

- [ ] 3.1 `AceitarConvitePage.tsx` + rota pública `/convite/:token` (ao lado de `/cadastro`)
- [ ] 3.2 Mostra `Comprador` e papel; campo de senha (revelar + indicador ao vivo, reusar de `admin/usuarios`)
- [ ] 3.3 Token inválido/expirado → mensagem clara, sem formulário

## 4. Visibilidade por papel

- [ ] 4.1 `AdminLayout` / `BottomNavBar`: esconder "Membros" e "Plano & cobrança" para `OPERADOR`
- [ ] 4.2 `RoleGuard` (ou extensão do `AuthGuard`): barrar `/admin/membros` e a rota de cobrança para `OPERADOR`

## 5. admin/usuarios

- [ ] 5.1 Listagem inclui o `OWNER` com marcação; sem ações de papel/senha/inativação para ele
- [ ] 5.2 Formulário de cadastro não oferece `OWNER` como papel

## 6. Testes

- [ ] 6.1 `MembrosPage`: lista com papéis/status; convidar chama a API; reenviar/revogar; `OWNER` sem ações destrutivas
- [ ] 6.2 `AceitarConvitePage`: token válido → define senha e loga; inválido → mensagem clara
- [ ] 6.3 Visibilidade: `OPERADOR` não vê os itens; acesso direto a `/admin/membros` é barrado
- [ ] 6.4 `UsuariosPage`: `OWNER` aparece protegido; `OWNER` não é papel criável

## 7. Checagem de saúde

- [ ] 7.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 7.2 Verificação manual com o back: convidar um `OPERADOR`, aceitar por outro navegador, confirmar limites de menu e rota; tentar mexer no `OWNER`
