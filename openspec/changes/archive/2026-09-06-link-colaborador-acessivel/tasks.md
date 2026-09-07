## 1. API

- [x] 1.1 `configuracoes.api.ts`: `useEnviarLinkColaborador()` — `api.post<void>('/api/configuracoes/colaborador/enviar-link', { email })`

## 2. Card do link

- [x] 2.1 `LinkColaboradorCard`: monta a URL absoluta (`window.location.origin + '/colaborador/' + linkColaboradorToken`), exibe o link, texto de 1 linha explicando o que ele faz
- [x] 2.2 Botão **Copiar** — `navigator.clipboard.writeText(url)` + toast "Link copiado"
- [x] 2.3 Campo de e-mail + botão **Enviar por e-mail** → `useEnviarLinkColaborador().mutateAsync({ email })`; sucesso → toast "Link enviado para <email>"; erro → `ApiError.message`; e-mail vazio/ inválido desabilita o botão

## 3. Colocação

- [x] 3.1 Incluir o `LinkColaboradorCard` no `DashboardPage`
- [x] 3.2 Na tela de Configurações: manter o link ou substituir pelo mesmo card (não pode deixar de existir lá sem alternativa)

## 4. Testes

- [x] 4.1 `LinkColaboradorCard.test.tsx`: copiar chama `clipboard.writeText` com a URL absoluta certa e mostra o toast
- [x] 4.2 Enviar com e-mail válido chama o endpoint com `{ email }`; e-mail inválido não chama
- [x] 4.3 Erro da API exibe `ApiError.message`
- [x] 4.4 `npm test` + `npm run build` + `npm run lint` verdes
