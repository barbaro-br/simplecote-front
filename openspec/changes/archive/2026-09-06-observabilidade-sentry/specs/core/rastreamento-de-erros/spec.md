## ADDED Requirements

### Requirement: Rastreamento de erros de runtime do front

O front SHALL reportar erros de runtime não tratados (erros de render, exceções em handlers, promessas rejeitadas) a um serviço externo. A ativação SHALL depender exclusivamente da variável de build `VITE_SENTRY_DSN`; sem ela, nenhum código de rastreamento inicializa e o comportamento é idêntico ao atual, sem chamada de rede a serviço externo. O front SHALL envolver a aplicação num limite de erro (error boundary) que, ao capturar, mostra uma mensagem de recuperação em pt-BR com opção de recarregar e reporta o erro. O `SessaoExpiradaError` (transitório, já tratado com redirect para `/login`) SHALL ser descartado antes do envio. Nenhum dado pessoal (e-mail do usuário, token de link) SHALL ser anexado aos eventos.

#### Scenario: Erro de render com DSN configurada

- **WHEN** um componente lança durante o render e `VITE_SENTRY_DSN` estava definida no build
- **THEN** o error boundary mostra o fallback em pt-BR com opção de recarregar, e o erro é reportado ao serviço externo

#### Scenario: Sessão expirada não é reportada

- **WHEN** uma chamada autenticada recebe `401` e o fluxo lança `SessaoExpiradaError`
- **THEN** o redirect para `/login` acontece normalmente e nada é enviado ao serviço externo

#### Scenario: Build sem DSN

- **WHEN** o front é buildado sem `VITE_SENTRY_DSN`
- **THEN** nenhum código de rastreamento inicializa e não há chamada de rede a serviço externo
