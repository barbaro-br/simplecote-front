## Technical Design

- **Arquivo:** `simplecote-back/src/main/java/com/simplecote/participante/EnvioDeConvite.java`
- **Alteração:** No bloco `catch (NotificacaoException ex)`, adicionar log usando o Logger do `slf4j`.
- **Implementação:**
  1. Adicionar anotação `@Slf4j` (se usar lombok) ou instanciar `Logger`.
  2. Dentro do catch: `log.error("Falha ao enviar e-mail para o representante " + representante.getEmail(), ex);`
  3. Isso imprimirá a stack trace subjacente do `JavaMailSender` (Spring Mail) nos logs do Heroku, permitindo identificar o código SMTP da Brevo que recusa o envio (ex: 550, 535, etc).
