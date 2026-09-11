## Why

O back implementou um catálogo global de referência entre todos os Compradores (change `catalogo-global-de-produtos` em `simplecote-back`) e um endpoint novo, `GET /api/produtos/sugestoes?q=`, que sugere produto por **nome** ou por **trecho de código de barras** — combinando o que o próprio Comprador já tem cadastrado com o que outros Compradores (ou o Open Food Facts) já sabem sobre aquele produto. Hoje o `ProdutoForm` só ajuda quando o admin **já tem o código de barras em mãos** (botão "Buscar" + bipagem); quem só sabe o nome do produto ainda digita tudo na mão, mesmo quando aquele produto já existe no catálogo global.

## What Changes

- O campo "Nome do produto" do `ProdutoForm` ganha sugestão ao digitar (debounce, a partir de 2 caracteres), só no cadastro de um produto novo (não na edição).
- A sugestão traz dois grupos, vindos de `GET /api/produtos/sugestoes?q=`:
  - **"Já no seu catálogo"**: produtos do próprio Comprador que combinam com o texto — é só aviso (evita recadastrar um produto parecido), nunca preenche nada sozinho.
  - **"Sugestão da base compartilhada"**: produtos do catálogo global que o Comprador ainda não tem — ao clicar, preenche nome **e** código de barras (nunca embalagem/quantidade, que continuam do admin), mesmo comportamento que a busca por código de barras já tem hoje.
- A busca por trecho de código de barras nas telas de "Produtos" e "Adicionar item na cotação" **já existe** (client-side, sobre o catálogo do próprio Comprador) — nada muda ali; esta change é só o caminho novo (por nome, no cadastro) apontando também pro catálogo global.

## Capabilities

### Modified Capabilities

- `admin/produtos`: novo Requirement de sugestão ao digitar o nome no cadastro de produto.

## Impact

- `src/admin/produtos/produtos.api.ts`: `useSugestoesCadastro(q)` (`useQuery`, `enabled` só com 2+ caracteres, `staleTime` curto) chamando `GET /api/produtos/sugestoes`; tipos `SugestaoCatalogoGlobal`/`SugestoesCadastro`.
- `src/admin/produtos/ProdutoForm.tsx`: campo "Nome do produto" ganha um painel de sugestão (debounce via `useDebounce` já existente), só quando `!isEdit`; escolher uma sugestão do catálogo global preenche nome + código de barras e reusa o aviso "sugerido" já existente (variante de texto própria, "preenchidos da base compartilhada", pra não confundir com o aviso do fluxo por código de barras).
- Testes em `produtos.test.tsx`: escolher sugestão do catálogo global preenche nome e código; "já no seu catálogo" aparece só como aviso e não preenche nada.
- Sem dependência nova (reusa `@tanstack/react-query`, `useDebounce` já existentes).
- Contrato com o `simplecote-back`: `GET /api/produtos/sugestoes?q=` (change `catalogo-global-de-produtos`, já implementado e em produção).
