## Investigação: Falha no Envio de E-mails

**O Problema Relatado:**
Os e-mails de convite não estão chegando na caixa de entrada dos representantes, mesmo com a integração da Brevo configurada no Heroku. O usuário não tinha certeza se o gargalo estava no front-end ou no back-end.

**A Descoberta (Root Cause):**
Fiz uma inspeção profunda no log e no banco de dados de produção do Heroku. Aqui está o que acontece de verdade:

1. O **Front-end** envia a requisição de Abrir Cotação (ou Reenviar Convites) perfeitamente.
2. O **Back-end** recebe a requisição e aciona a classe `EnvioDeConvite.java`.
3. O Java tenta despachar o e-mail pela porta SMTP da Brevo, mas **recebe um erro da Brevo** (provavelmente por autenticação recusada, falha de SSL/TLS, ou bloqueio do remetente `@gmail.com`).
4. **A Falha Oculta:** No código do back-end (`EnvioDeConvite.java`), o erro é "engolido". Veja:
   ```java
   } catch (NotificacaoException ex) {
       participante.registrarEnvioConvite(ConviteStatus.FALHOU);
   }
   ```
   A exceção não é "logada" no console (nem com `System.out.println`, nem com `logger.error`). Por isso os logs do Heroku ficam silenciosos. A única prova de que falhou é que o banco de dados está marcando a coluna `convite_status` como `FALHOU` para quase todos os testes que você fez!

**A Solução (O que precisamos alterar no Back-end):**
1. Precisamos adicionar um log nessa classe (ex: `ex.printStackTrace()` ou usar o `slf4j` do Spring) para que a mensagem de erro exata da Brevo apareça nos logs do Heroku.
2. Sabendo a mensagem exata (ex: "Auth failed", "Invalid Sender", "Relay Access Denied"), nós arrumamos a configuração final lá no painel da Brevo ou nas variáveis do Heroku.

## Escopo desta Change
- Alterar o arquivo `EnvioDeConvite.java` no projeto `simplecote-back` para imprimir a stack trace ou mensagem da `NotificacaoException`.
- Fazer deploy dessa alteração.
- Disparar um e-mail novamente pelo app e ler o log do Heroku para ver o erro verdadeiro e matar o problema de vez.
