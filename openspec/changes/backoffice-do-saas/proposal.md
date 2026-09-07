## Why

Com supermercados entrando sozinhos, o time do SimpleCote precisa de uma forma de administrar os clientes: ver quantos `Comprador` existem, quem está em teste, ativo ou inadimplente, suspender ou reativar uma conta, resetar a senha de um admin travado e, para dar suporte, entrar no painel do cliente para reproduzir um problema. Hoje isso só dá para fazer no banco, à mão.

## What Changes

- Novo papel **`SUPER_ADMIN`** (não vinculado a um `Comprador` — abordagem 1, mesmo backend). Só ele acessa o backoffice.
- Nova árvore de rotas **`/backoffice/**`**, separada do painel do cliente (`/admin/**`) e da área pública, com sua própria guarda: exige sessão **e** papel `SUPER_ADMIN`; qualquer outro usuário recebe "não encontrado" (não revela a existência da área).
- Telas do backoffice:
  - **Lista de compradores**: nome, plano, `status_assinatura`, data de criação, último acesso, contadores de uso; filtro por status (com destaque para inadimplentes) e busca por nome/e-mail.
  - **Detalhe do comprador**: os mesmos dados + ações **suspender/reativar**, **resetar senha de um admin** (gera senha temporária ou dispara e-mail de redefinição) e **entrar como suporte** (impersonar).
- **Impersonação**: "entrar como suporte" pede um motivo, troca a sessão por um token de suporte com escopo daquele `Comprador` (emitido pelo back, marcado como impersonação e com expiração curta), abre o painel daquele cliente — em `<slug>.simplecote.app/admin` quando `tenant-por-subdominio` estiver ativo — com uma **tarja permanente "Modo suporte — <comprador>"** e um botão "sair do modo suporte" que restaura a sessão de `SUPER_ADMIN` e volta ao backoffice. Toda ação nesse modo é auditada pelo back.
- Ações destrutivas (suspender, resetar senha, impersonar) passam por diálogo de confirmação nomeando a consequência (regra 8 do `AGENTS.md`).

## Capabilities

### Added Capabilities

- `backoffice`: área interna do dono do SaaS (papel `SUPER_ADMIN`) para listar e administrar os `Comprador` — status de assinatura, suspender/reativar, resetar senha de admin e entrar como suporte (impersonação auditada).

## Impact

- Novo `src/backoffice/`: `routes` próprias montadas em `src/routes.tsx` sob `/backoffice`; `BackofficeGuard.tsx` (sessão + `SUPER_ADMIN`); `CompradoresPage.tsx`, `CompradorDetalhePage.tsx`, `backoffice.api.ts`, `backoffice.schema.ts`; `ModoSuporteBanner.tsx`.
- `src/shared/auth/`: o `AuthContext`/claim passa a expor `role`; `AuthGuard` do `/admin` inalterado, mas o app precisa saber diferenciar sessão normal de sessão de suporte (tarja + "sair do modo suporte").
- `src/routes.tsx`: terceira árvore de rotas (`/backoffice/**`), sem `AdminLayout` nem `TemaClaro`. Servida em `backoffice.simplecote.app` (host reservado, não um `<slug>` de loja) quando `tenant-por-subdominio` estiver ativo — o `BackofficeGuard` também rejeita o acesso a `/backoffice` a partir de um subdomínio de loja. Ver `RISCOS-TRANSVERSAIS.md` §0.
- Testes: `BackofficeGuard` (sem `SUPER_ADMIN` → não encontrado), `CompradoresPage` (lista, filtro por status, busca), `CompradorDetalhePage` (ações com confirmação chamam a API), impersonação (troca de sessão, tarja aparece, "sair do modo suporte" restaura).
- **Contrato com o `simplecote-back`**: papel `SUPER_ADMIN`; rotas `/api/admin/compradores` **fora do filtro de inquilino** (enxergam todos), protegidas só para `SUPER_ADMIN`; ações de suspender/reativar/resetar-senha; emissão de token de suporte com escopo de um `Comprador`, marcado como impersonação, expiração curta e trilha de auditoria.
