## 1. Tipo compartilhado

- [x] 1.1 `ValoresIniciaisProduto` (nome + código de barras) em `produtos.schema.ts`

## 2. ProdutoForm aceita pré-preenchimento

- [x] 2.1 Prop opcional `valoresIniciais`, só afeta o cadastro de produto novo (não a edição)
- [x] 2.2 `defaultValues` usa `valoresIniciais` quando não é edição; mostra o aviso "preenchidos da base compartilhada" desde a abertura

## 3. AdicionarItemModal

- [x] 3.1 Sem match no próprio catálogo (estado vazio existente): busca `GET /api/produtos/sugestoes` (debounced) e mostra o grupo do catálogo global
- [x] 3.2 Achar no próprio catálogo não dispara a busca no catálogo global (evita chamada de rede desnecessária)
- [x] 3.3 Clicar numa sugestão chama `aoCadastrarProduto({ nome, codigoBarras })`
- [x] 3.4 `aoCadastrarProduto` (prop) passa a aceitar o pré-preenchimento opcional

## 4. Encanamento nos dois lugares que montam o modal

- [x] 4.1 `ItensSection.tsx`: guarda o pré-preenchimento e repassa pro `ProdutoForm` empilhado
- [x] 4.2 `CotacaoDetalhePage.tsx`: mesma coisa (é o outro lugar que usa `AdicionarItemModal`, pra Cotação já `ABERTA`)

## 5. Testes

- [x] 5.1 Sem match local + sugestão do catálogo global existe → aparece e clicar chama `aoCadastrarProduto` com nome+código certos
- [x] 5.2 Achar no próprio catálogo → não chama `GET /api/produtos/sugestoes`
- [x] 5.3 `npx tsc --noEmit`, `oxlint`, `vitest run` (suíte completa) verdes
