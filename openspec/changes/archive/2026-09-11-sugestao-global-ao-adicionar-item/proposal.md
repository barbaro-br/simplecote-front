## Why

Desde a change `sugestao-de-cadastro-no-produto`, o cadastro de produto sugere nome+código do catálogo global. O modal "Adicionar Produtos" (montar uma cotação) continua isolado disso: se o Comprador procura um item que ainda não tem no próprio catálogo, a única saída é "Cadastrar novo produto" digitando tudo na mão — mesmo quando aquele produto já existe na base compartilhada entre todos os Compradores.

## What Changes

- No modal "Adicionar Produtos", quando a busca não encontra nada no catálogo do próprio Comprador (estado vazio já existente), o sistema também consulta `GET /api/produtos/sugestoes?q=` (mesmo endpoint da change anterior) e mostra as sugestões do catálogo global encontradas.
- Clicar numa sugestão abre o cadastro (o mesmo modal empilhado "Cadastrar novo produto" que já existe) já com **nome e código de barras preenchidos** — o admin só completa tipo de embalagem e quantidade, igual ao fluxo de bipagem que já existe.
- Sem match no próprio catálogo **e** sem sugestão do catálogo global: continua exatamente como hoje ("Cadastrar novo produto" do zero).
- A busca por trecho de código de barras/nome no **próprio catálogo** (a lista já carregada) não muda — o catálogo global só entra como complemento no estado vazio, com debounce próprio pra não gerar uma chamada de rede a cada tecla.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o estado vazio do modal "Adicionar Produtos" ganha sugestão do catálogo global.

## Impact

- `src/admin/cotacoes/AdicionarItemModal.tsx`: `useSugestoesCadastro` (debounced) só quando a busca local não acha nada; grupo de sugestão no estado vazio; `aoCadastrarProduto` passa a aceitar um pré-preenchimento opcional (`ValoresIniciaisProduto`, tipo já existente em `produtos.schema.ts`).
- `src/admin/produtos/produtos.schema.ts`: `ValoresIniciaisProduto` (nome + código de barras) — reusado tanto aqui quanto no `ProdutoForm`.
- `src/admin/produtos/ProdutoForm.tsx`: novo prop opcional `valoresIniciais` — só se aplica ao cadastro de um produto novo (nunca na edição), preenche `nome`/`codigoBarras` nos `defaultValues` e já mostra o aviso "preenchidos da base compartilhada".
- `src/admin/cotacoes/ItensSection.tsx` e `CotacaoDetalhePage.tsx`: os dois lugares que renderizam `AdicionarItemModal` + o `ProdutoForm` empilhado passam a guardar e repassar o pré-preenchimento.
- Testes: sem match local mostra sugestão do catálogo global e clicar chama `aoCadastrarProduto` com nome+código; achar no próprio catálogo não dispara a busca no catálogo global.
- Sem dependência nova, sem mudança no back (reusa `GET /api/produtos/sugestoes` e `POST /api/produtos/bipado`, ambos já existentes).
