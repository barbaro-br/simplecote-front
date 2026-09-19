## 1. Contratos da API e Schemas
- [x] 1.1 Adicionar funções no `configuracoes.api.ts` para `/api/configuracoes/whatsapp/status`, `/qr-code`, `/disconnect`.
- [x] 1.2 Adicionar funções no `backoffice.api.ts` para `/api/admin/whatsapp/status`, `/qr-code`, `/disconnect`.

## 2. Ajustes na UI (Remoção do wa.me)
- [x] 2.1 Em `RepresentantesModal.tsx`, remover o ícone do WhatsApp que abria a janela externa, mantendo só a ação nativa do backend.
- [x] 2.2 Em `CotacaoDetalhePageV2.tsx`, remover a geração do link `urlWhatsApp` e o botão na dropdown de representantes.

## 3. UI de Configurações do Comprador
- [x] 3.1 Adicionar em `ConfiguracoesPage.tsx` o card para Gerenciar WhatsApp, exibindo apenas se `comprador.usaWhatsAppProprio` for true. Replicar lógica de QR Code e Conectado do backoffice.
- [ ] 3.2 Mockar endpoints em `configuracoes.test.tsx` e escrever um teste simples de renderização.

## 4. UI Global no Backoffice
- [x] 4.1 Criar ou adicionar à view do backoffice o card de "WhatsApp Global (Aplicação)", consumindo os hooks do admin globais.
- [ ] 4.2 Mockar e testar em `backoffice.test.tsx`.

## 5. QA
- [x] 5.1 Rodar `npm test`, `npm run build`, e `npm run lint`.
