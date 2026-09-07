## Why

Hoje o app está com a identidade de **uma** loja vazando para onde deveria ser sempre SimpleCote:

- `index.html` tem `<title>Sarah Supermercado Cotações</title>` fixo.
- `LoginPage.tsx` mostra `configuracao?.nome` (o nome da loja, vindo de `GET /api/configuracoes`) como título — e ainda por cima chama uma rota autenticada de dentro de uma tela anônima.

Para virar SaaS, a régua é: **antes do login é sempre SimpleCote; a identidade da loja só aparece depois do login.** Essa change é pequena, não depende do back nem do subdomínio, e dá pra subir rápido — deixa o app apresentável para mostrar a um cliente.

## What Changes

- **Antes do login — sempre SimpleCote:**
  - `index.html`: `<title>` fixo → `SimpleCote` (título base da aba).
  - `LoginPage.tsx`: remover a chamada a `useConfiguracaoLoja()`; exibir o nome **"SimpleCote"** e o mote **"Cotações simplificadas"** fixos, iguais para todo mundo. Sem skeleton de carregamento de config.
  - `EsqueciSenhaPage.tsx` e qualquer outra tela anônima: conferir que não renderizam dado de loja nem chamam `/api/configuracoes`.
- **Depois do login — a identidade da loja:**
  - O nome da loja no shell (sidebar/topbar) e a cor de marca continuam vindo de `GET /api/configuracoes` via `ConfiguracaoLojaProvider` (já é assim — só quando autenticado).
  - Passa a atualizar o **título da aba** para `<nome da loja> · SimpleCote` quando a config carrega; volta para `SimpleCote` no logout.
  - **Logo da loja na aba (favicon dinâmico): fica de fora desta change** — depende de um campo `logoUrl` novo em `/api/configuracoes` (back). Anotado como follow-up.

## Capabilities

### Modified Capabilities

- `shared`: novas requirements separando a identidade do produto (SimpleCote, antes do login) da identidade da loja (depois do login), incluindo o título da aba do navegador. Não altera a requirement de favicon existente.

## Impact

- `index.html`: `<title>`.
- `src/admin/login/LoginPage.tsx`: tira `useConfiguracaoLoja`/`Skeleton`, usa textos fixos "SimpleCote" / "Cotações simplificadas".
- `src/admin/recuperar-senha/EsqueciSenhaPage.tsx`: verificação (ajuste só se estiver puxando dado de loja).
- `src/admin/configuracoes/ConfiguracaoLojaProvider.tsx`: `useEffect` que seta `document.title` a partir de `data?.nome`; reset no unmount / quando `isAutenticado` vira `false`.
- Testes: `LoginPage` renderiza "SimpleCote" e **não** dispara `GET /api/configuracoes`; após autenticar com config carregada, `document.title` contém o nome da loja; no logout, volta a "SimpleCote".
- Sem mudança de contrato com o back. (O `logoUrl` para favicon dinâmico, se for feito depois, é aditivo em `/api/configuracoes`.)
- Independente de `tenant-por-subdominio` e `site-institucional-e-precos`; complementa as duas (a tela de login deixa de ter branding de loja, ao contrário do que a versão inicial de `tenant-por-subdominio` propunha).
