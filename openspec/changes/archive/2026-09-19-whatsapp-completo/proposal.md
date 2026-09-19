## Why

Para automatizar o fluxo completo de envio de WhatsApp. A API Evolution já está integrada no backend, e a loja precisa de um lugar no painel de configurações para conectar o WhatsApp, além do painel Global no admin. O botão de enviar convite no front não deve mais abrir a guia `wa.me`, já que o backend dispara a mensagem automaticamente ao reenviar.

## What Changes

- Adição de uma seção "Integração WhatsApp" em `/admin/configuracoes` para o Comprador conectar seu WhatsApp.
- Adição de uma rota Global `/backoffice/whatsapp` para o Super Admin gerenciar a conexão do WhatsApp Global (instância `padrao`).
- Remoção do botão de WhatsApp em `CotacaoDetalhePageV2` e `RepresentantesModal`, utilizando apenas o botão "Reenviar Convite" (que agora faz tudo pela API).

## Capabilities

### New Capabilities
- `admin/configuracoes-whatsapp`: A seção do painel do comprador para conectar o WhatsApp próprio se habilitado.
- `backoffice/whatsapp-global`: A seção do backoffice para conectar o WhatsApp da aplicação.

### Modified Capabilities
- `admin/cotacoes`: O envio de convite não possui mais botão `wa.me`, apenas o botão genérico de "Reenviar convite".

## Impact

- `CotacaoDetalhePageV2`, `RepresentantesModal`, `ConfiguracoesPage` (nova aba/sessão).
- API clients (`configuracoes.api.ts`, `backoffice.api.ts`).
