## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `GET /api/avisos` (loja) e `GET/POST/PATCH/DELETE /api/admin/avisos` (SUPER_ADMIN) — change `backoffice-avisos-no-painel`

## 1. Schema e API

- [ ] 1.1 `src/avisos/avisos.schema.ts`: `NivelAviso` (`INFO|ATENCAO|CRITICO`), `Aviso` (id, titulo, corpo, nivel, publicadoEm), `AvisoAdmin` (+ ativo, expiraEm, criadoPor)
- [ ] 1.2 `src/avisos/avisos.api.ts`: `useAvisosVigentes()` → `GET /api/avisos`
- [ ] 1.3 `backoffice.api.ts` (ou `src/backoffice/avisos.api.ts`): `useAvisosAdmin()`, `useCriarAviso()`, `useAlternarAviso()`, `useRemoverAviso()` → `/api/admin/avisos`, invalidando a lista

## 2. Banner no painel do cliente

- [ ] 2.1 `src/avisos/AvisosBanner.tsx`: para cada aviso vigente não dispensado, um banner com cor/ícone por `nivel`, título, corpo e botão dispensar
- [ ] 2.2 Dispensar grava o id em `localStorage['avisos-dispensados']` (array); leitura/escrita em try/catch, fallback em memória se indisponível
- [ ] 2.3 `AdminLayout.tsx`: montar `<AvisosBanner />` logo abaixo do `<ModoSuporteBanner />`

## 3. Tela de gestão no backoffice

- [ ] 3.1 `src/backoffice/AvisosPage.tsx`: tabela (título, nível, ativo, publicado em, expira em) + ações (toggle ativo, remover com confirmação inline)
- [ ] 3.2 Formulário "Novo aviso": título, corpo (textarea), nível (select), expira em (date opcional) → `useCriarAviso`
- [ ] 3.3 `routes.tsx`: rota `path: 'avisos'` sob `/backoffice` → `AvisosPage`; `BackofficeLayout.tsx`: item "Avisos"

## 4. Testes

- [ ] 4.1 `src/avisos/avisos.test.tsx`: mock com 1 aviso vigente → banner aparece; clicar dispensar → some; remontar → continua sumido (localStorage)
- [ ] 4.2 `backoffice.test.tsx`: criar aviso chama `POST /api/admin/avisos` e aparece na lista; toggle chama `PATCH /api/admin/avisos/{id}`; remover chama `DELETE`

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: criar um aviso `ATENCAO` no backoffice, abrir o painel de uma loja e ver o banner; dispensar; recarregar
