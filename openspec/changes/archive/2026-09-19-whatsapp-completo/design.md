## Arquitetura

1. `src/admin/configuracoes`: 
   - Adicionar os endpoints no `configuracoes.api.ts` (ou criar `whatsapp.api.ts`).
   - Modificar a página de configurações da loja para incluir um card "Integração WhatsApp", consumindo o componente genérico de WhatsApp se possível (ou repetindo o UI já feito para o Backoffice).
2. `src/backoffice`:
   - Adicionar endpoints em `backoffice.api.ts` (ex: `useGlobalQrCodeWhatsApp`, `useGlobalStatusWhatsApp`, `useGlobalDesconectarWhatsApp`).
   - Criar uma página `/backoffice/whatsapp` ou adicionar no painel inicial para gerenciar a instância.
3. `src/admin/cotacoes`:
   - Em `RepresentantesModal.tsx` e `CotacaoDetalhePageV2.tsx`, remover o botão e funções relacionadas à abertura de aba (`wa.me`).

## Estado

Hooks do TanStack Query lidam com o refetching. 

## Mudanças em Testes

- Mockar os novos endpoints `/api/configuracoes/whatsapp/*` em `configuracoes.test.tsx` e verificar a renderização do QR code.
- Mockar `/api/admin/whatsapp/*` em `backoffice.test.tsx` para o painel global.
- Ajustar os testes de `RepresentantesModal` que verificavam a presença do botão de whatsapp.
