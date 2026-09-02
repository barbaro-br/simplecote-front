## Why

Hoje não existe nenhum conceito de "a loja" no sistema — nome, cor de marca e telefone são valores fixos no código (`"SimpleCote"` em `AdminLayout.tsx:77` e `LoginPage.tsx:53`; `--primary` fixo em `src/index.css`). Para este deploy (Sara Supermercado) e, principalmente, para o plano de transformar este projeto num clone multi-tenant no futuro, é preciso um lugar único onde essas informações da loja existam como dado configurável — não mais hardcode.

Confirmado com o usuário: por enquanto **1 instância = 1 loja** (sem multi-tenant real ainda) — então a Configuração é uma **linha única (singleton)**, sem `lojaId`/isolamento de dados. Confirmado também: o nome da loja **substitui** "SimpleCote" na tela de login, revisando o requirement `shared/design-system` "Identidade de marca consistente" que hoje exige o oposto (marca fixa do produto, sem nome de cliente).

## What Changes

- Novo item de menu com ícone de engrenagem ("Configurações") na sidebar, levando a `/admin/configuracoes`.
- Tela de Configurações com um formulário único: nome da loja, cor de marca (usada como `--primary`), telefone da loja, layout de e-mail (texto/template usado nos e-mails enviados aos representantes).
- Nome e cor configurados passam a ser aplicados em toda a interface: título da tela de login (substitui "SimpleCote" hardcoded), cabeçalho da sidebar, e a cor `--primary` usada em toda a aplicação (botões, foco, destaques).
- Valor inicial (seed) desta loja: nome = "Sara Supermercado".
- **Depende de um endpoint no backend que ainda não existe** (`simplecote-back` não tem nenhum conceito de configuração de loja hoje — verificado por busca no código). Esta change cobre só o lado front; o contrato de API assumido está documentado em `design.md` e precisa de uma change correspondente no repositório do back antes de esta poder ser aplicada de ponta a ponta.

## Capabilities

### New Capabilities

- `admin/configuracoes`: tela de configurações da loja (nome, cor, telefone, layout de e-mail), acessível via ícone de engrenagem na sidebar.

### Modified Capabilities

- `shared/design-system`: o requirement "Identidade de marca consistente" muda de "a tela de login SHALL mostrar a marca fixa SimpleCote" para "a tela de login SHALL mostrar o nome da loja configurado".

## Impact

- **Front** (este repositório): novo item de menu + rota, nova página `src/admin/configuracoes/`, ajuste em `LoginPage.tsx` e `AdminLayout.tsx` para ler o nome da loja de um contexto/hook em vez do literal `"SimpleCote"`, aplicação de `--primary` dinâmico no boot do app.
- **Back** (`simplecote-back`, fora deste repositório): precisa expor a Configuração da loja via API (contrato assumido documentado em `design.md`). **Bloqueante** para a integração real — ver task 0 em `tasks.md`.
- Não introduz multi-tenant: é uma única configuração global, sem `lojaId`.
