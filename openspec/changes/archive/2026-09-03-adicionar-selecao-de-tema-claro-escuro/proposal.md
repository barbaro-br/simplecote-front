## Why

Pedido do usuário: além da cor de marca (`corPrimaria`) já configurável em
Configurações, ele quer poder escolher entre um tema **claro** e um tema
**escuro** pro painel — o projeto já tem os tokens CSS do tema escuro
(`.dark`, especificados em `shared/design-system`) prontos, só nunca foi
exposto nenhum controle de UI pra ativá-los. Depende do backend já
expor/persistir o campo `tema` (change
`adicionar-tema-de-cor-a-configuracao-da-loja`, no repo `simplecote-back`).

## What Changes

- Adicionar um seletor "Tema" (Claro/Escuro) em Configurações, mesmo
  padrão visual do seletor "Estilo de navegação" já existente (radio
  buttons), persistindo via `PUT /api/configuracoes`.
- `ConfiguracaoLojaProvider` passa a alternar a classe `dark` no elemento
  raiz (`document.documentElement`) conforme `data.tema` — mesmo ponto
  único de bootstrap que já aplica `corPrimaria`.

## Out of Scope

- **Fundo derivar automaticamente o matiz da cor de marca escolhida**
  (ideia levantada na mesma conversa): exigiria converter a cor de marca
  (hex, ex. `#0f766e`) pro espaço OKLCH pra extrair o matiz — uma peça de
  cálculo de cor à parte, com seu próprio risco de arredondamento/precisão.
  Fica registrada em `docs/backlog-ux-2026-09-03.md` como evolução futura;
  esta change só resolve o par claro/escuro pedido explicitamente.

## Capabilities

### Modified Capabilities

- `shared/design-system`: requirement "Cores de estado sempre por token
  semântico" — não mexe na regra em si, mas o tema escuro (`.dark`) deixa
  de ser inatingível pela UI (nenhum requirement cobria a ausência de
  seletor até agora); adiciona novo requirement "Seleção de tema
  claro/escuro" nesta capability.
- `admin/configuracoes`: requirement "Editar dados da loja" — adiciona o
  campo `tema` ao formulário de configuração.

## Impact

- `src/admin/configuracoes/configuracoes.schema.ts`
- `src/admin/configuracoes/configuracoes.api.ts`
- `src/admin/configuracoes/ConfiguracoesPage.tsx`
- `src/admin/configuracoes/ConfiguracaoLojaProvider.tsx`
