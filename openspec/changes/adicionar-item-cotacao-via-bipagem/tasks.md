## Preparation
- [x] Ler e entender `proposal.md`, `specs/cotacao/bipagem-mobile/spec.md` e `design.md`.

## Implementation
- [x] Atualizar `cotacoes.api.ts` com o novo hook `useBiparItemCotacao` chamando o endpoint do back (`POST /api/cotacoes/{id}/itens/bipar`).
- [x] Criar arquivo `useBarcodeScanner.ts` encapsulando `@zxing/browser`.
- [x] Criar a página `BipagemPage.tsx` e registrar na tabela de rotas do admin.
- [x] Implementar a lógica condicional (`200`, `202`, `404`) no callback de sucesso/erro da mutation da bipagem.
- [x] Construir a UI responsiva: área superior com `<video id="scanner" />` e área inferior com o histórico.
- [x] Testar integração com modais de cadastro para garantir o pause/resume da câmera.
