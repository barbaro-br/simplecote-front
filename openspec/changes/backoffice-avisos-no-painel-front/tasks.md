## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `GET /api/avisos` (loja) e `GET/POST/PATCH/DELETE /api/admin/avisos` (SUPER_ADMIN) — change `backoffice-avisos-no-painel`

## 1. Schema e API

- [x] 1.1 `src/avisos/avisos.schema.ts`: `NivelAviso` (`INFO|ATENCAO|CRITICO`), `Aviso` (id, titulo, corpo, nivel, publicadoEm, expiraEm), `AvisoAdmin` (+ ativo, criadoPor)
- [x] 1.2 `src/avisos/avisos.api.ts`: `useAvisosVigentes()` → `GET /api/avisos`
- [x] 1.3 `src/backoffice/avisos.api.ts`: `useAvisosAdmin()`, `useCriarAviso()`, `useAlternarAviso()`, `useRemoverAviso()` → `/api/admin/avisos`, invalidando a lista

## 2. Banner no painel do cliente

- [x] 2.1 `src/avisos/AvisosBanner.tsx`: para cada aviso vigente não dispensado, um banner com cor/ícone por `nivel`, título, corpo e botão dispensar
- [x] 2.2 Dispensar grava o id em `localStorage['avisos-dispensados']` (array); leitura/escrita em try/catch, fallback em memória se indisponível
- [x] 2.3 `AdminLayout.tsx`: montar `<AvisosBanner />` logo abaixo do `<ModoSuporteBanner />`

## 3. Tela de gestão no backoffice

- [x] 3.1 `src/backoffice/AvisosPage.tsx`: tabela (título, nível, ativo, publicado em, expira em) + ações (toggle ativo, remover com confirmação inline)
- [x] 3.2 Formulário "Novo aviso": título, corpo (textarea), nível (select), expira em (date opcional) → `useCriarAviso`
- [x] 3.3 `routes.tsx`: rota `path: 'avisos'` sob `/backoffice` → `AvisosPage`; `BackofficeLayout.tsx`: item "Avisos"

## 4. Testes

- [x] 4.1 `src/avisos/avisos.test.tsx`: mock com 1 aviso vigente → banner aparece; clicar dispensar → some; remontar → continua sumido (localStorage)
- [x] 4.2 `backoffice.test.tsx`: criar aviso chama `POST /api/admin/avisos` e aparece na lista; toggle chama `PATCH /api/admin/avisos/{id}`; remover chama `DELETE`

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: criar um aviso `ATENCAO` no backoffice, abrir o painel de uma loja e ver o banner; dispensar; recarregar — **pendente**: o back `backoffice-avisos-no-painel` ainda não está no ar
