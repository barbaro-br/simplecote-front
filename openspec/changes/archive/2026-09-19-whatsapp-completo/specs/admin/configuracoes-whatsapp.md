# Configurações de WhatsApp (Comprador)

Apenas renderizado se `comprador.usaWhatsAppProprio` for `true` (obtido pelo backend na rota de perfil/configurações).

Mostra o status de conexão da loja chamando `GET /api/configuracoes/whatsapp/status`. Se aberto, exibe "Conectado" e botão "Desconectar" (chama `POST /api/configuracoes/whatsapp/disconnect`).
Se não aberto, exibe "Gerar QR Code" (`GET /api/configuracoes/whatsapp/qr-code`).
