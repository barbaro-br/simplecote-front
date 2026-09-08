## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `GET/POST /api/admin/compradores/{id}/notas`, `DELETE .../notas/{notaId}`, `GET .../{id}/timeline` — change `backoffice-notas-e-auditoria`

## 1. API e schema

- [ ] 1.1 `backoffice.schema.ts`: `Nota` (id, texto, autorSuperAdminId, criadoEm); `TimelineItem` (tipo, quando, ator, descricao); enum de tipos
- [ ] 1.2 `backoffice.api.ts`: `useNotas(id)`, `useAdicionarNota(id)`, `useRemoverNota(id)`, `useTimeline(id)` — invalida `notas`/`timeline` após mutação

## 2. Seção "Notas e histórico" no detalhe

- [ ] 2.1 `NotasEHistorico.tsx` (novo componente montado no `CompradorDetalhePage`): textarea + botão "Adicionar nota"; desabilita com texto vazio; erro do back em toast
- [ ] 2.2 Lista de notas — autor, data (relativa + absoluta no title), texto; botão remover com confirmação inline (padrão da zona de perigo, sem `window.confirm`)
- [ ] 2.3 Timeline — lista vertical; por item: ícone/rotulo do tipo (`iconePorTipoEvento`/`rotuloTipoEvento`), data relativa, ator (nome/e-mail ou "sistema"), descrição; estados carregando/vazio/erro
- [ ] 2.4 Encaixar a seção no fluxo do detalhe (depois de administradores, antes da zona de perigo)

## 3. Testes

- [ ] 3.1 `backoffice.test.tsx`: escrever + "Adicionar nota" chama `POST .../notas` e a nota aparece na lista (mock)
- [ ] 3.2 `backoffice.test.tsx`: "Remover" (após confirmação) chama `DELETE .../notas/{notaId}`
- [ ] 3.3 `backoffice.test.tsx`: a timeline renderiza um mock com 3 tipos diferentes, do mais recente ao mais antigo

## 4. Checagem de saúde

- [ ] 4.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 4.2 Verificação manual com o back: abrir uma loja, adicionar/remover nota, suspender pela tela e ver o item aparecer na timeline
