## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Papel `OWNER` (um por `Comprador`; backfill nos existentes); `role` no JWT
- [ ] 0.2 `GET /api/organizacao/membros`
- [ ] 0.3 `POST /api/organizacao/convites` (e-mail + papel) + e-mail de convite; reenviar; revogar
- [ ] 0.4 `GET /api/organizacao/convites/:token` (contexto) e `POST` (aceitar definindo senha)
- [ ] 0.5 Inativar/remover membro (barrando o `OWNER`)
- [ ] 0.6 Enforcement de papel nas rotas sensíveis (`/api/organizacao/**`, `/api/assinatura`)

## 1. Papel na sessão

- [x] 1.1 `src/shared/domain/papel.ts` (`Papel`, `ROTULO_PAPEL`, `podeVerArea`) + `src/shared/auth/jwt.ts` (`decodificarClaims`, decisão §E); `useAuth` expõe `papel` e `podeVer('membros' | 'cobranca')`

## 2. Gestão de membros

- [x] 2.1 `src/admin/organizacao/organizacao.schema.ts` + `organizacao.api.ts`
- [x] 2.2 `MembrosPage.tsx`: lista (nome, e-mail, papel, status); estados carregando/vazio/erro
- [x] 2.3 `ConvidarMembroDialog.tsx`: e-mail + papel (`ADMIN`/`OPERADOR`); erro do backend no formulário
- [x] 2.4 Ações: reenviar e revogar convite; inativar membro `ATIVO` não-OWNER (reusa `POST /api/usuarios/{id}/inativar`) com `ConfirmarDialog`; `OWNER` e `INATIVO` sem essas ações
- [x] 2.5 `src/routes.tsx`: `/admin/membros` (autenticada, atrás do `RoleGuard`)

## 3. Aceite de convite

- [x] 3.1 `AceitarConvitePage.tsx` + rota pública `/convite/:token` (ao lado de `/cadastro`)
- [x] 3.2 Mostra `Comprador` e papel; campo de senha (revelar + indicador ao vivo, mesmo padrão de `admin/usuarios`)
- [x] 3.3 Token inválido/expirado → mensagem clara, sem formulário

## 4. Visibilidade por papel

- [x] 4.1 `AdminLayout` / `BottomNavBar`: esconder "Membros" para `OPERADOR` (a aba "Plano & cobrança" é da change `planos-e-cobranca`, dentro de Configurações — o primitivo `podeVer('cobranca')` fica pronto para ela)
- [x] 4.2 `RoleGuard`: barrar `/admin/membros` para `OPERADOR` (aceita `area` `'membros' | 'cobranca'` — a rota de cobrança é da change `planos-e-cobranca`)

## 5. admin/usuarios

- [x] 5.1 Listagem inclui o `OWNER` com marcação; sem ações de papel/senha/inativação para ele
- [x] 5.2 Formulário de cadastro não oferece `OWNER` como papel

## 6. Testes

- [x] 6.1 `MembrosPage`: lista com papéis/status; convidar chama a API; reenviar/revogar; `OWNER` sem ações destrutivas
- [x] 6.2 `AceitarConvitePage`: token válido → define senha e loga; inválido → mensagem clara
- [x] 6.3 Visibilidade: `OPERADOR` não vê os itens; acesso direto a `/admin/membros` é barrado
- [x] 6.4 `UsuariosPage`: `OWNER` aparece protegido; `OWNER` não é papel criável

## 7. Checagem de saúde

- [x] 7.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 7.2 Verificação manual com o back: convidar um `OPERADOR`, aceitar por outro navegador, confirmar limites de menu e rota; tentar mexer no `OWNER`
