## Architecture

O fluxo é integrado nativamente ao `react-router-dom` em uma rota `/admin/cotacoes/:id/bipar`.
O pacote `@zxing/browser` será utilizado via um Hook customizado `useBarcodeScanner` que encapsula o gerenciamento da câmera, permissões e decodificação do feed de vídeo, entregando o evento de leitura (callback).
Haverá uma API de integração para o novo endpoint via React Query `useBiparItemCotacao(cotacaoId)`.

## Component Design

- `BipagemPage`: View principal. Consiste em duas metades: topo (feed de vídeo + scanner line animada) e base (log dos últimos produtos lidos na sessão atual).
- `useBarcodeScanner`: Hook que faz o setup do `BrowserMultiFormatReader` em uma tag `<video>`, permitindo start/stop.
- Modais:
  - `CadastroRapidoModal`: Exibido para `202`. Mostra o nome travado e pede só `unidade` e `quantidadePorEmbalagem`.
  - `ProdutoForm`: Reutilizado ou adaptado para `404` para cadastro total.

## State Management

- Lista efêmera de itens bipados guardada em um array `useState` apenas para o histórico visual da sessão.
- Flag `isScanning` para pausar a câmera programaticamente quando um modal abre.
