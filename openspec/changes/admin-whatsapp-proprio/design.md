## Context

A infraestrutura de mensagens via WhatsApp (Evolution API) foi finalizada no backend, que agora expõe os endpoints para gerenciar o pareamento e o status da instância de cada Comprador. A interface será exclusiva do `SUPER_ADMIN` na `CompradorDetalhePage.tsx`. O front precisa expor a ativação dessa feature (o booleano `usaWhatsAppProprio` já existe no `CompradorAdminResponse` após adicionar no schema) e consumir o fluxo de pareamento via QR Code.

## Goals / Non-Goals

**Goals:**
- Prover interface no backoffice para ativar e desativar o WhatsApp Próprio.
- Permitir geração e exibição de QR Code de pareamento.
- Mostrar status da conexão atual.
- Permitir desconectar o WhatsApp.

**Non-Goals:**
- Não expor essas configurações para o usuário logado no painel da loja (`/admin`).
- Não reescrever regras de negócio no front-end; a validação de disponibilidade e o status são definidos pelo back.

## Decisions

### 1. Extensão do backoffice.schema.ts
- Adicionar o campo `usaWhatsAppProprio: z.boolean()` no `compradorAdminSchema`. Isso sincroniza o tipo no front com o DTO Java que já expõe esse valor.

### 2. Extensão do backoffice.api.ts
- Criar schemas para respostas dos endpoints do WhatsApp: `qrCodeResponseSchema` (`base64: z.string()`) e `connectionStatusResponseSchema` (`state: z.string()`).
- Adicionar mutações no hook (`useAlternarWhatsAppProprio`, `useDesconectarWhatsApp`) e queries (`useQrCodeWhatsApp`, `useStatusWhatsApp`). O `useQrCodeWhatsApp` e `useStatusWhatsApp` não devem fazer polling automático agressivo de status a princípio, mas podem fornecer um botão de "Atualizar Status" ou re-buscar ao focar a tela.

### 3. Componentização em CompradorDetalhePage.tsx
- Criar um novo componente / seção no detalhe do Comprador. 
- Usar um Toggle (Switch) nativo ou botões para alterar o `usaWhatsAppProprio`.
- Quando `usaWhatsAppProprio` for `true`, exibir as chamadas do QR Code e Status:
  - Se o status for `"open"`, mostra "Conectado" e botão "Desconectar".
  - Se status for outro (ex: "connecting"), mostra o status e botão "Gerar QR Code".

## Risks / Trade-offs

- **[Risk]** O QR Code gerado pela Evolution API tem tempo de expiração.
  - **Mitigation**: A API já lida com a geração, se o QR Code expirar o usuário poderá clicar em "Gerar QR Code" novamente para chamar o endpoint.
- **[Risk]** Erros da API ao não estar conectado e pedir QR Code.
  - **Mitigation**: Tratar a exibição dos erros via `ApiError` e `toast.error` se necessário.
