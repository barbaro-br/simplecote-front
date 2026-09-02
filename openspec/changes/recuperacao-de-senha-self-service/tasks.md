## 0. Pré-requisito de backend (bloqueante para integração real)

- [ ] 0.1 Confirmar com o repositório `simplecote-back` o contrato de `POST /api/auth/esqueci-senha` e `POST /api/auth/redefinir-senha` (ver proposta em `design.md`); ajustar aqui se o back expuser algo diferente. Enquanto os endpoints não existirem, as tasks 1-2 podem ser feitas com mock; a task 3 (integração real) fica bloqueada até eles existirem.

## 1. Solicitar redefinição

- [x] 1.1 Adicionar link "Esqueci minha senha" em `LoginPage.tsx`, levando a uma nova rota (ex. `/esqueci-senha`).
- [x] 1.2 Criar a tela de solicitação (campo de e-mail, `react-hook-form`+`zod`); ao enviar, exibir sempre a mesma mensagem genérica de confirmação, independentemente da resposta do backend indicar e-mail existente ou não.
- [x] 1.3 Teste: enviar com e-mail válido e com e-mail inexistente (mockado) e confirmar que a mensagem exibida é idêntica nos dois casos.

## 2. Redefinir senha via link

- [x] 2.1 Criar a tela de redefinição (ex. `/redefinir-senha/:token`), com campo de nova senha + confirmação, reaproveitando a validação já usada em `RedefinirSenhaForm.tsx` (mínimo 8 caracteres, confirmação igual).
- [x] 2.2 Tratar token inválido/expirado: exibir mensagem clara em vez do formulário quebrado (mock da resposta 4xx do backend).
- [x] 2.3 Teste: submissão com sucesso, confirmação não bate, token inválido — os três cenários do requirement `admin/recuperar-senha`.

## 2.5 Adendo de usabilidade (pedido do usuário, fora do escopo original)

- [x] 2.4 Em `EsqueciSenhaPage.tsx`, no estado "enviado": detectar o domínio do e-mail digitado e, se reconhecido, mostrar um botão "Abrir Gmail" (`gmail.com`/`googlemail.com` → `https://mail.google.com/mail/u/0/#search/in%3Ainbox`, `target="_blank"`) ou "Abrir Outlook" (`outlook.com`/`hotmail.com`/`live.com`/`msn.com` → `https://outlook.live.com/mail/0/inbox`, `target="_blank"`). Para domínios não reconhecidos, não mostrar nenhum botão (evitar link que não funciona).
- [x] 2.5 Em `RedefinirSenhaPage.tsx`, no estado "sucesso": redirecionar automaticamente para `/login` após ~3 segundos, mostrando um contador visível ("Redirecionando em 3… 2… 1…"), mas mantendo o link/botão "Ir para o login" clicável imediatamente para quem não quiser esperar.

## 3. Integração real com o backend (depende da task 0)

- [ ] 3.1 Trocar os mocks pelas chamadas reais aos dois endpoints; verificar end-to-end com o backend rodando localmente, incluindo o e-mail realmente chegando (ambiente de dev).
- [ ] 3.2 Rodar `npm test` completo e confirmar 0 regressões, incluindo os testes de `LoginPage`.
