## Context

Ver `proposal.md` — Why. Já existem `admin/usuarios` (cria usuário com senha inicial, papéis `ADMIN`/`OPERADOR`) e `admin/recuperar-senha` (fluxo de token por e-mail para redefinir senha). O convite reaproveita a mesma ideia de "rota pública com token que define senha".

## Goals / Non-Goals

**Goals**
- Trazer time por e-mail sem o admin manusear senhas.
- `OPERADOR` de verdade limitado — não só um menu escondido.

**Non-Goals**
- Transferência de propriedade (`OWNER` → outro) na UI — fica para depois; por ora é operação de suporte/backoffice.
- Papéis customizados / permissões granulares — três papéis fixos.
- Um usuário pertencer a vários `Comprador` / troca de organização — fora de escopo (o cadastro cria sempre 1:1).

## Decisions

- **Hierarquia fixa `OWNER > ADMIN > OPERADOR`.** `OWNER`: tudo, único, imutável por outros. `ADMIN`: tudo menos mexer no `OWNER`. `OPERADOR`: opera cotações/produtos, sem membros nem cobrança. Simples de explicar e de enforçar.
- **Convite reusa o padrão de `admin/recuperar-senha`.** Rota pública `/convite/:token`, `GET` para mostrar contexto, `POST` para aceitar com senha. Nada de novo conceito de auth.
- **Enforcement de papel é do backend; o front espelha.** As rotas `/api/organizacao/**` e `/api/assinatura` exigem o papel no back. O front esconde o menu e usa um `RoleGuard` só para não mostrar tela que o back recusaria — nunca como única barreira (regra do `AGENTS.md`).
- **`role` vem do JWT/`/api/organizacao/eu`.** Preferir claim no JWT (já é como o `comprador_id` chega). O `useAuth` expõe `role`; um helper `podeVer(area)` centraliza a regra.
- **Reaproveitar `admin/usuarios` em vez de substituir.** Criar acesso com senha na hora ainda é útil (funcionário sem e-mail corporativo). A tela de Membros é o caminho principal; a de Usuários vira o caso de exceção.

## Risks / Trade-offs

- **Duas telas para "gente que acessa" (Usuários e Membros)** pode confundir → posicionar Membros como a principal (no menu), e Usuários como "adicionar acesso sem e-mail" dentro dela ou logo ao lado. Decidir na implementação; não fragmentar rota à toa.
- **`RoleGuard` no front dá falsa sensação de segurança** → teste explícito de que o back recusa `OPERADOR` nas rotas sensíveis (contrato), além do teste de UI.
- **Convite para e-mail que depois faz cadastro público** (mesma pessoa, dois caminhos) → o back precisa decidir a precedência; o front só mostra o erro que vier.

## Migration Plan

1. Back: papel `OWNER` (backfill: o usuário mais antigo / o do bootstrap de cada `Comprador` vira `OWNER`), rotas de convite e de membros, enforcement de papel.
2. Front: `useAuth.role` + `podeVer` (inócuo) → tela de Membros + convite → esconder menus e `RoleGuard`.
3. Rollback: remover `/admin/membros` e o `RoleGuard`; `admin/usuarios` volta a ser a única gestão de acesso.
