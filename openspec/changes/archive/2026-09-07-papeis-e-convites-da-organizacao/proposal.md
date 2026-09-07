## Why

Hoje o painel tem só dois papéis (`ADMIN`, `OPERADOR`) e a única forma de adicionar alguém é o admin criar o usuário já com uma senha inicial — o admin escolhe e comunica a senha. Num SaaS, quem se cadastrou é o **dono** da conta (papel distinto, não pode ser rebaixado nem removido pelos outros), e a forma normal de trazer o time é **convidar por e-mail**, com a pessoa definindo a própria senha. Também falta restringir o que cada papel enxerga (cobrança e gestão de membros não são para `OPERADOR`).

## What Changes

- Papel **`OWNER`** (o usuário criado no cadastro público): aparece na gestão de membros, **não pode ser rebaixado nem inativado** por outro usuário, e há **um por `Comprador`**. Não é criável pela tela de usuários.
- Nova tela **`/admin/membros`** (gestão da organização):
  - Lista os membros do `Comprador` com nome, e-mail, papel (`OWNER`/`ADMIN`/`OPERADOR`) e status (ativo/inativo/convite pendente).
  - **Convidar por e-mail + papel**: dispara `POST /api/organizacao/convites`; a pessoa recebe um link, abre `/convite/:token`, define a senha e entra já vinculada ao `Comprador` no papel do convite.
  - Convites pendentes podem ser **reenviados** ou **revogados**.
  - Remover/inativar um membro (menos o `OWNER`).
- **Visibilidade por papel**: `OWNER` e `ADMIN` veem "Membros" e "Plano & cobrança"; `OPERADOR` não vê esses itens no menu e é barrado nas rotas correspondentes.
- A tela de usuários atual (`admin/usuarios`, criação com senha inicial) continua existindo para o caso de criar acesso sem e-mail; ganha só a ciência do papel `OWNER`.

## Capabilities

### Added Capabilities

- `admin/organizacao`: gestão de membros do `Comprador` — papel `OWNER`, convite por e-mail com aceite e definição de senha, reenvio/revogação de convite, e visibilidade de áreas sensíveis por papel.

### Modified Capabilities

- `admin/usuarios`: nova requirement reconhecendo o papel `OWNER` na listagem e protegendo-o de rebaixamento/inativação por esta tela (sem alterar o cadastro com senha inicial de `ADMIN`/`OPERADOR`).

## Impact

- Novo `src/admin/organizacao/`: `MembrosPage.tsx`, `ConvidarMembroDialog.tsx`, `AceitarConvitePage.tsx`, `organizacao.api.ts` (`GET /api/organizacao/membros`, `POST /api/organizacao/convites`, reenviar, revogar, remover membro; `GET/POST /api/organizacao/convites/:token`), `organizacao.schema.ts`.
- Reuso do campo de senha com revelar/indicador de `admin/usuarios` (idealmente extraído para `shared`).
- `src/routes.tsx`: rota autenticada `/admin/membros`; rota pública `/convite/:token` (ao lado de `/cadastro`).
- `src/shared/auth/`: `useAuth` expõe `role`; helper `podeVer('cobranca'|'membros')`.
- `src/admin/layout/` (`AdminLayout` / `BottomNavBar`): esconder "Membros" e "Plano & cobrança" para `OPERADOR`; `AuthGuard` (ou um `RoleGuard`) barra as rotas.
- Testes: `MembrosPage` (lista com papéis/status; convidar chama a API; reenviar/revogar; `OWNER` sem ação de rebaixar/remover), `AceitarConvitePage` (token válido → define senha e entra; inválido → mensagem clara), visibilidade (`OPERADOR` não vê os itens e é barrado nas rotas).
- **Contrato com o `simplecote-back`**: papel `OWNER` (um por `Comprador`, definido no cadastro); `POST /api/organizacao/convites` (e-mail + papel), e-mail de convite com token, `GET/POST /api/organizacao/convites/:token` (aceitar definindo senha), reenviar/revogar; `GET /api/organizacao/membros`; enforcement de papel nas rotas sensíveis (`/api/assinatura`, `/api/organizacao/**`).
- **E-mail de convite (back)**: mesmo padrão de remetente dos demais e-mails do sistema — Brevo com `mail.simplecote.com.br`, remetente fixo, display name = nome da loja, `Reply-To` = e-mail do `OWNER` (ver `cadastro-publico-self-service`).
