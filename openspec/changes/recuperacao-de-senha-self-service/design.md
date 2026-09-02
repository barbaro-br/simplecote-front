## Context

Ver `proposal.md`. `LoginPage.tsx` hoje é só e-mail+senha (`react-hook-form`+`zod`), sem link de recuperação. `AuthContext.tsx` guarda só o token, sem estado de usuário/papel. `RedefinirSenhaForm.tsx` (`admin/usuarios`) já valida senha (8+ caracteres, confirmação igual) — a mesma regra se aplica aqui, só muda quem aciona (o próprio usuário, via token, em vez de um admin logado).

## Goals / Non-Goals

**Goals:**
- Um usuário ADMIN/OPERADOR consegue redefinir a própria senha sem depender de outro admin.
- Não vazar informação sobre quais e-mails têm conta (anti-enumeration).

**Non-Goals:**
- Não cria um novo papel/permissão (o esclarecimento do usuário confirmou que "representante" já funciona via link tokenizado existente, sem senha — fora de escopo aqui).
- Não implementa 2FA nem política de senha além da já existente (8+ caracteres).
- Geração, expiração e invalidação do token são responsabilidade do backend — o front só consome o resultado.

## Decisions

- **Contrato de API assumido** (a confirmar com quem implementar o back):
  ```
  POST /api/auth/esqueci-senha
    body: { email: string }
    → sempre 200, corpo genérico (não revela se o e-mail existe)

  POST /api/auth/redefinir-senha
    body: { token: string, novaSenha: string }
    → 200 em sucesso
    → 4xx (ProblemDetail) se o token for inválido/expirado
  ```
- **Confirmação sempre genérica no front, mesmo que o backend algum dia retorne algo diferenciado** — o front não deve depender de uma distinção que o backend não deveria estar expondo. Se o backend retornar erro real (ex.: 500), aí sim mostrar erro; a resposta de "e-mail não existe" especificamente NUNCA deve virar uma mensagem diferente no front.
- **Rate limiting e proteção contra abuso são responsabilidade do backend**, fora do escopo deste front-repo — mencionado aqui só para não ser esquecido na change correspondente do back.

## Risks / Trade-offs

- [Risco] **Bloqueante real**: os dois endpoints não existem no back hoje → Mitigação: task 0 dedicada, mesmo padrão de `configuracoes-da-loja-basico`; as telas podem ser construídas e testadas com mock enquanto o back não expõe os endpoints.
- [Risco] Se o front expuser qualquer diferença de comportamento entre "e-mail existe" e "e-mail não existe" (mesmo sem querer — ex.: tempo de resposta diferente por causa de um `await` condicional), abre brecha de enumeration → Mitigação: garantir que o front trata a resposta de forma idêntica nos dois casos, sem lógica condicional baseada em detalhes da resposta.
- [Risco] Segurança de e-mail/token é responsabilidade do back e está fora do que este change consegue garantir sozinho → Mitigação: documentar claramente como dependência explícita (ver Impact em `proposal.md`), para não passar a falsa impressão de que a feature está completa só com o front pronto.
