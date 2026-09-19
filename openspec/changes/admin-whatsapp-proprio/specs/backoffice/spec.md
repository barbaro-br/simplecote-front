## ADDED Requirements

### Requirement: Gerenciar conexão de WhatsApp do Comprador

O detalhe de um comprador no backoffice SHALL oferecer uma seção para gerenciar o "WhatsApp Próprio" (integração isolada via Evolution API) daquela loja. A interface SHALL permitir alternar se a loja usa o WhatsApp Próprio (`POST /api/admin/compradores/{id}/whatsapp-proprio?usa={boolean}`). Quando o WhatsApp Próprio estiver ativado, a interface SHALL exibir o status da conexão (`GET /api/admin/compradores/{id}/whatsapp/status`); se não estiver conectado, SHALL permitir gerar e exibir o QR Code de conexão (`GET /api/admin/compradores/{id}/whatsapp/qr-code`); se estiver conectado, SHALL permitir desconectar (`POST /api/admin/compradores/{id}/whatsapp/disconnect`).

#### Scenario: Ativar e ver QR Code
- **WHEN** o operador ativa o WhatsApp Próprio e o status indica que não há conexão ("connecting" ou erro)
- **THEN** a tela mostra um botão para "Gerar QR Code" que busca e exibe o código na tela.

#### Scenario: Desconectar WhatsApp ativo
- **WHEN** o WhatsApp Próprio está ativado e o status é "open"
- **THEN** a tela mostra um botão para "Desconectar", que ao ser clicado chama o endpoint de desconexão.

#### Scenario: Desativar WhatsApp Próprio
- **WHEN** o operador desativa o WhatsApp Próprio no toggle
- **THEN** a integração é desligada e a interface oculta as opções de QR Code e status.
