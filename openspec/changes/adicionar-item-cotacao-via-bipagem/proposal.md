## Why

Atualmente, adicionar itens a uma cotação exige pesquisa textual, o que é lento para colaboradores em chão de loja (estoquistas). A necessidade é uma tela mobile-first onde o usuário possa utilizar a câmera do celular para "bipar" produtos e adicioná-los rapidamente à cotação, delegando o processamento do código para o backend.

## What Changes

- Criação de uma rota e tela dedicada (ex: `/admin/cotacoes/[id]/bipar`).
- Integração da biblioteca `@zxing/browser` para ativar a câmera do dispositivo e iniciar leitura contínua de códigos de barra.
- Consumo de uma nova rota do backend (`POST /api/cotacoes/{id}/itens/bipar`).
- Tratamento dos cenários de resposta do backend:
  - `200 OK`: Item adicionado (mostrar toast de sucesso e listar na tela).
  - `202 Accepted`: Produto sugerido mas inexistente localmente (abrir modal rápido de cadastro simplificado).
  - `404 Not Found`: Produto não encontrado nem no catálogo nem na API externa (abrir modal de cadastro completo).
- Exibição de um histórico da sessão contendo os itens bipados recentemente.

## Capabilities

### New Capabilities
- `cotacao/bipagem-mobile`: Fluxo mobile-first de leitura contínua de câmera para adição de itens via código de barras.

### Modified Capabilities

## Impact

- Impacto na UI com a nova tela focada em usabilidade mobile.
- Utilização de permissão de câmera do navegador.
- Dependência do novo endpoint no backend.
