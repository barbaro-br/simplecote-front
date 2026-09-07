## ADDED Requirements

### Requirement: Contexto de inquilino nos eventos de erro

Quando há sessão autenticada e o rastreamento de erros está ativo (`VITE_SENTRY_DSN` definida no build), o front SHALL anexar aos eventos enviados ao serviço externo uma tag identificando o `Comprador` da sessão por um identificador técnico (id ou slug). O front SHALL NOT anexar nome do supermercado, e-mail, telefone ou qualquer outro dado pessoal — a regra de não incluir dado pessoal nos eventos permanece. Sem sessão (rotas públicas por token) ou sem DSN no build, nenhuma tag de inquilino é anexada e o comportamento é idêntico ao atual.

#### Scenario: Erro reportado durante uma sessão de admin

- **WHEN** um erro de runtime é capturado com uma sessão ativa e `VITE_SENTRY_DSN` presente no build
- **THEN** o evento enviado carrega a tag do `Comprador` (id/slug), e nenhum dado pessoal

#### Scenario: Erro em rota pública não carrega inquilino

- **WHEN** um erro é capturado numa rota pública por token (sem sessão)
- **THEN** o evento não carrega tag de `Comprador`

#### Scenario: Logout limpa a tag

- **WHEN** o usuário sai da sessão
- **THEN** eventos capturados depois disso não carregam mais a tag do `Comprador` anterior
