## Why

O painel do admin tem duas telas para gerir quem acessa o sistema — "Usuários" (`/admin/usuarios`) e "Membros" (`/admin/membros`) — que hoje operam sobre a mesma entidade (`Usuario`) e já se sobrepõem por baixo dos panos: `GET /api/organizacao/membros` é literalmente a lista de usuários mais os convites pendentes, e a ação de inativar em "Membros" chama a mesma rota `POST /api/usuarios/{id}/inativar` usada por "Usuários". O resultado é que administrar alguém completamente hoje exige trocar de tela (convidar e ver pendentes só em "Membros"; editar nome/e-mail/papel e redefinir senha só em "Usuários"). Além disso, a aba "Usuários" aparece no menu para todos os papéis — inclusive `OPERADOR`, que o backend nega com 403 em qualquer chamada a `/api/usuarios/**` (rota cai no catch-all `hasRole(ADMIN)` do `SecurityConfig`), então hoje `OPERADOR` vê uma aba que nunca funciona para ele.

## What Changes

- Unifica as duas telas em uma só, em `/admin/membros` (rótulo "Membros"), reunindo tudo: listar (ativos, inativos, convites pendentes), convidar por e-mail, **criar diretamente com senha inicial** (ação hoje exclusiva de "Usuários"), editar nome/e-mail/papel, redefinir senha, reenviar/revogar convite e inativar.
- **BREAKING**: remove a rota/aba `/admin/usuarios` como tela própria. Acessos diretos a `/admin/usuarios` passam a redirecionar para `/admin/membros`, para não quebrar links/favoritos existentes.
- Como efeito colateral da unificação, a tela consolidada herda o gating de papel que "Membros" já tem hoje (visível só para `OWNER`/`ADMIN`) — corrige o caso de `OPERADOR` ver uma aba "Usuários" que sempre falhava com 403.
- Nenhuma rota de back muda: todos os endpoints necessários já existem (`POST/PUT/GET /api/usuarios/**`, `POST /api/usuarios/{id}/senha`, `POST /api/usuarios/{id}/inativar`, `POST /api/organizacao/convites`, `POST /api/organizacao/convites/{id}/reenviar`, `DELETE /api/organizacao/convites/{id}`).

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `admin/organizacao`: ganha as ações de criação direta com senha, edição de nome/e-mail/papel e redefinição de senha de um membro (hoje exclusivas de `admin/usuarios`), e o redirecionamento da rota legada `/admin/usuarios`.
- `admin/usuarios`: capacidade removida — cada requisito migra para `admin/organizacao` (ver detalhe na spec) ou já estava coberto lá (inativação, proteção do `OWNER`).

## Impact

- **Front**: `src/admin/usuarios/*` (UsuariosPage, UsuarioForm, RedefinirSenhaForm, usuarios.api.ts, usuarios.schema.ts) é incorporado a `src/admin/organizacao/*` (MembrosPage, ConvidarMembroDialog, organizacao.api.ts, organizacao.schema.ts); a pasta `src/admin/usuarios` deixa de existir como tela própria.
- **Navegação**: `ITENS`/`ITENS_MAIS` (`AdminLayout.tsx`, `BottomNavBar.tsx`) perdem a entrada `/admin/usuarios`; a rota é redirecionada, não apenas removida.
- **Nenhuma mudança de API/back** — reuso integral dos endpoints existentes.
- **Specs**: `openspec/specs/admin/organizacao/spec.md` (modificada) e `openspec/specs/admin/usuarios/spec.md` (removida, com migração documentada por requisito).
