# Spec Delta: Logging de E-mail

## 10.8 Notificações
- Falhas de envio do notificador devem registrar o motivo da falha nos logs da aplicação para fins de depuração (diagnóstico de infraestrutura e recusa de SMTP). O comportamento de registrar `FALHOU` e não propagar exceção continua inalterado.
