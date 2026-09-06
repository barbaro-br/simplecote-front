## 1. API

- [x] 1.1 `cotacoes.api.ts`: `useRecotarSemVencedor(cotacaoId: string)` — `api.post<CotacaoDuplicadaResponse>('/api/cotacoes/' + cotacaoId + '/recotar-sem-vencedor')`, `onSuccess` invalida `['cotacoes']`
- [x] 1.2 Reusar `CotacaoDuplicadaResponse` / `ItemOmitido` de `cotacoes.schema.ts`

## 2. UI na tela de Resultado

- [x] 2.1 `ResultadoPage.tsx`: botão "Recotar itens sem vencedor" visível só quando `resultado.itensSemVencedor.length > 0`
- [x] 2.2 Clique abre `ConfirmarDialog` curto → confirma → `useRecotarSemVencedor(id).mutateAsync()` → `navigate('/admin/cotacoes/' + nova.id)`
- [x] 2.3 `omitidos` na resposta → toast listando os produtos omitidos e o motivo; erro → `ApiError.message`

## 3. Testes

- [x] 3.1 `ResultadoPage.test.tsx`: botão ausente sem itens sem vencedor, presente com
- [x] 3.2 Confirmar chama `POST .../recotar-sem-vencedor` e navega para a nova cotação
- [x] 3.3 Resposta com omitidos mostra o aviso; erro mostra a mensagem
- [x] 3.4 `npm test` + `npm run build` + `npm run lint` verdes
