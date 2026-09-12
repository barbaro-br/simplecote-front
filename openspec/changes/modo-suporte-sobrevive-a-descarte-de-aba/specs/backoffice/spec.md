## MODIFIED Requirements

### Requirement: Entrar como suporte (impersonação)

O backoffice SHALL permitir "entrar como suporte" no painel de um `Comprador`. A ação SHALL exigir um motivo, SHALL trocar a sessão por um token de suporte com escopo daquele `Comprador` (emitido pelo backend, marcado como impersonação e com expiração curta), e SHALL abrir o `/admin` daquele cliente. Durante o modo suporte, o painel SHALL exibir uma tarja permanente identificando o `Comprador` impersonado e um botão "sair do modo suporte" que restaura a sessão de `SUPER_ADMIN`. Um reload da aba (F5) durante o modo suporte SHALL manter a sessão de suporte ativa (sem cair de volta pro `SUPER_ADMIN`) enquanto o token de suporte não tiver expirado, mesmo se o navegador tiver descartado a aba em segundo plano nesse meio-tempo. Essa persistência SHALL ser isolada por aba: duas abas com sessões de suporte em `Comprador`es diferentes SHALL manter tokens independentes, sem uma sobrescrever a da outra.

#### Scenario: Iniciar o modo suporte

- **WHEN** o `SUPER_ADMIN` aciona "entrar como suporte", informa o motivo e confirma
- **THEN** o painel do `Comprador` abre com a tarja "Modo suporte — <nome do comprador>" visível

#### Scenario: Sair do modo suporte

- **WHEN** o usuário em modo suporte aciona "sair do modo suporte"
- **THEN** a sessão volta a ser a de `SUPER_ADMIN` e o backoffice reaparece

#### Scenario: Motivo é obrigatório

- **WHEN** o `SUPER_ADMIN` tenta iniciar o modo suporte sem informar um motivo
- **THEN** a ação não é enviada e o campo de motivo é apontado como obrigatório

#### Scenario: Reload em modo suporte não volta pro backoffice

- **WHEN** o usuário em modo suporte recarrega a aba (F5), incluindo o caso em que o navegador descartou a aba em segundo plano antes disso
- **THEN** o painel do `Comprador` impersonado reabre com a tarja de modo suporte, sem passar pela sessão de `SUPER_ADMIN`

#### Scenario: Duas abas de suporte não se confundem

- **WHEN** o `SUPER_ADMIN` tem duas abas em modo suporte, cada uma num `Comprador` diferente, e recarrega uma delas
- **THEN** essa aba restaura o `Comprador` que ela mesma estava impersonando, não o da outra aba
