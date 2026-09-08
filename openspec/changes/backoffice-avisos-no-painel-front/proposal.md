## Why

Par do back `backoffice-avisos-no-painel`: a plataforma passa a ter avisos (`GET /api/avisos` para a loja, CRUD em `/api/admin/avisos` para o `SUPER_ADMIN`). Falta (1) o banner no painel do cliente e (2) a tela de gestão no backoffice.

## What Changes

- **Painel do cliente** (`AdminLayout`): ao montar, busca `GET /api/avisos` e renderiza um banner por aviso vigente, abaixo do `ModoSuporteBanner`. Cor/ícone por `nivel` (`INFO`/`ATENCAO`/`CRITICO`). Cada banner é dispensável — o dispensar guarda o id em `localStorage` (`avisos-dispensados`), com try/catch; um aviso não volta depois de dispensado naquele navegador.
- **Backoffice** — nova rota `/backoffice/avisos`: lista de avisos (título, nível, ativo, publicado em, expira em) + formulário "Novo aviso" (título, corpo, nível, expira em opcional) + toggle ativo + remover (confirmação inline). Entrada no `BackofficeLayout` ("Avisos").
- **Não** muda o guard nem outras telas.

## Capabilities

### Modified Capabilities

- `backoffice`: o backoffice ganha uma tela de gestão de avisos da plataforma (criar, ativar/desativar, remover).

### ADDED Capabilities

- `avisos`: o painel da loja mostra um banner por aviso vigente da plataforma, dispensável por navegador.

## Impact

- `src/avisos/avisos.api.ts` (novo): `useAvisosVigentes()` → `GET /api/avisos`.
- `src/avisos/AvisosBanner.tsx` (novo): renderiza os banners; dispensar via `localStorage` (try/catch, fallback sem persistência).
- `src/admin/layout/AdminLayout.tsx`: monta `<AvisosBanner />` abaixo do `ModoSuporteBanner`.
- `src/backoffice/avisos.api.ts` / `backoffice.api.ts`: `useAvisosAdmin()`, `useCriarAviso()`, `useAlternarAviso()`, `useRemoverAviso()` → `/api/admin/avisos`.
- `src/backoffice/AvisosPage.tsx` (novo) + rota em `src/routes.tsx` (`/backoffice/avisos`) + item no `BackofficeLayout`.
- `src/backoffice/backoffice.schema.ts` / novo `avisos.schema.ts`: `Aviso`, `AvisoAdmin`, `NivelAviso`.
- Testes: `avisos.test.tsx` — banner aparece para um aviso vigente e some ao dispensar (e continua sumido no remount); `backoffice.test.tsx` — criar um aviso chama `POST /api/admin/avisos` e ele aparece na lista; toggle chama `PATCH`.
- Sem dependência nova. Seção 0 = o back (`backoffice-avisos-no-painel`).
