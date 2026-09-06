## Why

O link permanente do colaborador (`/colaborador/{token}`) só aparece hoje na tela de Configurações, escondido. O usuário quer que ele seja fácil de achar, com **copiar** e **enviar por e-mail**. Continua sendo **um link único** por Comprador. A change de mesmo nome no `simplecote-back` adiciona `POST /api/configuracoes/colaborador/enviar-link`.

## What Changes

- Levar o link do colaborador para um lugar visível — um **card "Link do colaborador"** no Dashboard (e/ou um item no menu), com:
  - o link exibido,
  - botão **Copiar** (`navigator.clipboard.writeText`, com toast "Link copiado"),
  - campo de e-mail + botão **Enviar por e-mail** → `POST /api/configuracoes/colaborador/enviar-link`.
- Manter também na tela de Configurações (não remover de lá — só deixar de ser o único lugar), ou mover de vez para o card — decidir na implementação; o importante é ficar acessível fora de Configurações.
- Explicar em 1 linha o que o link faz ("qualquer pessoa com este link pode adicionar itens às cotações abertas").

## Capabilities

### Modified Capabilities

- `admin/configuracoes`: o link do colaborador deixa de viver só dentro da tela de Configurações — passa a ter um ponto de acesso visível (card no Dashboard) com copiar e enviar por e-mail.

## Impact

- `configuracoes.api.ts`: `useEnviarLinkColaborador()` — `api.post<void>('/api/configuracoes/colaborador/enviar-link', { email })`.
- Novo componente `LinkColaboradorCard` (em `admin/analise/` ou `admin/configuracoes/`): mostra `linkColaboradorToken` montado como URL absoluta (`window.location.origin + '/colaborador/' + token`), botão copiar, campo e-mail + enviar, texto explicativo.
- `DashboardPage.tsx`: incluir o card.
- `configuracoes.schema.ts`: já tem `linkColaboradorToken` — reusar.
- Testes: `LinkColaboradorCard` — copiar chama `clipboard.writeText` com a URL certa e mostra toast; enviar com e-mail válido chama o endpoint; e-mail vazio/ inválido não chama; erro da API via `ApiError.message`.
- Sem dependência nova. Depende da change do `simplecote-back` mesclada (só para o "enviar por e-mail"; "copiar" já funciona sem back novo).
