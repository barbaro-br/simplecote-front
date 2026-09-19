## 1. Atualizar Schemas e API

- [x] 1.1 Atualizar `src/backoffice/backoffice.schema.ts`: adicionar `usaWhatsAppProprio: z.boolean()` no `compradorAdminSchema`. Adicionar também os schemas de resposta da Evolution API: `qrCodeResponseSchema` (objeto com `base64: z.string()`) e `connectionStatusResponseSchema` (objeto com `state: z.string()`). Verificar tipagem usando o TS server/build.
- [x] 1.2 Atualizar `src/backoffice/backoffice.api.ts`: criar funções para `POST /api/admin/compradores/{id}/whatsapp-proprio?usa={boolean}`, `GET /api/admin/compradores/{id}/whatsapp/qr-code`, `GET /api/admin/compradores/{id}/whatsapp/status` e `POST /api/admin/compradores/{id}/whatsapp/disconnect`. Exportar mutations e queries via TanStack.

## 2. Mockar endpoints no MSW para testes

- [x] 2.1 Atualizar `src/backoffice/backoffice.test.tsx`: adicionar um estado para o whatsapp nos mocks (mockar endpoints do QR Code retornando um base64 falso, status `open` / `connecting`, e os requests de alternar e desconectar). Verificar rodando o vitest do arquivo para garantir que não há quebra.

## 3. Implementar a Interface (UI)

- [x] 3.1 Em `src/backoffice/CompradorDetalhePage.tsx`, criar um novo Card "Integração WhatsApp" após a zona de "Ações". O Card deve mostrar um toggle (ou botão que chame modal de confirmação) para alternar `usaWhatsAppProprio`. Verificar renderização rodando `npm run dev`.
- [x] 3.2 Se `usaWhatsAppProprio` for `true`, renderizar um sub-bloco que chama o hook de status. Se status for `open`, mostrar mensagem verde "WhatsApp Conectado" e um botão "Desconectar". Se for diferente, mostrar o status e um botão "Gerar QR Code". Verificar interatividade no browser.
- [x] 3.3 Ao clicar em "Gerar QR Code", chamar a query correspondente e exibir a imagem em base64 recebida. Verificar interatividade e renderização.

## 4. Revisão e Testes Integrados

- [x] 4.1 Adicionar em `src/backoffice/backoffice.test.tsx` cenários para alternar a configuração, gerar QR Code e exibir o status "Conectado", além da ação de desconectar. Verificar com `npm test`.
- [x] 4.2 Rodar `npm run build` e `npm run lint` para confirmar a conformidade do código final.
