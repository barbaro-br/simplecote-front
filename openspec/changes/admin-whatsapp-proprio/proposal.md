## Why

O backend já implementou a integração assíncrona com a Evolution API para disparos de WhatsApp e introduziu os endpoints necessários para gerenciar a conexão via QR Code no Backoffice (Super Admin). Precisamos agora consumir esses endpoints no front-end para permitir que a equipe do SimpleCote ative, conecte (via leitura de QR Code) e desconecte o "WhatsApp Próprio" dos Compradores (supermercados).

## What Changes

- Atualizar os schemas e tipos de `CompradorAdminResponse` para incluir `usaWhatsAppProprio`.
- Criar os novos hooks/chamadas de API no arquivo `backoffice.api.ts` para interagir com os endpoints `/api/admin/compradores/{id}/whatsapp-proprio` e `/api/admin/compradores/{id}/whatsapp/*`.
- Adicionar uma nova seção (Card) na `CompradorDetalhePage.tsx` para gerenciar a conexão de WhatsApp:
  - Toggle para "WhatsApp Próprio".
  - Botão para gerar/exibir o QR Code.
  - Exibição de status da conexão e botão para desconectar caso esteja conectado.

## Capabilities

### Modified Capabilities
- `backoffice`: Adicionar gerenciamento da conexão de WhatsApp (Evolution API) de um Comprador.

## Impact

- `src/backoffice/backoffice.schema.ts` (modificação do `compradorAdminSchema`)
- `src/backoffice/backoffice.api.ts` (novos endpoints)
- `src/backoffice/CompradorDetalhePage.tsx` (nova UI)
