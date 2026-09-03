## Context

`ProdutoForm({ aoSalvar, produtoParaEditar })` (`ProdutoForm.tsx:13`) já suporta os dois modos — `produtoParaEditar` indefinido cria, preenchido edita (chama `useAtualizarProduto`). `ProdutosPage.tsx` já usa exatamente esse padrão pra editar. `ItensSection.tsx` já tem um `Dialog` com `ProdutoForm` pro modo criação (`cadastroAberto`, linha ~142-149), acionado a partir de `AdicionarItemModal` via `aoCadastrarProduto`. `AdicionarItemModal.tsx` renderiza uma linha por produto (linha ~204-276) com checkbox, avatar, nome/embalagem e stepper de quantidade quando marcado — sem nenhum controle de edição hoje.

## Goals / Non-Goals

**Goals:**
- Reusar 100% do `ProdutoForm`/`useAtualizarProduto` já existentes — nenhum componente ou endpoint novo.
- Deixar o Comprador corrigir um produto sem perder o contexto de montagem da Cotação (mesmo espírito de "cadastrar sem sair da tela", já estabelecido).

**Non-Goals:**
- Não muda `ProdutosPage.tsx` nem `ProdutoForm.tsx` — só um novo ponto de entrada pro modo edição que eles já suportam.

## Decisions

- **Ícone de editar por linha, não um clique na linha inteira** — a linha inteira já tem `onClick` pra marcar/desmarcar o produto na Cotação (`handleToggle`); um ícone dedicado evita ambiguidade entre "selecionar" e "editar".
- **Reusa o mesmo `Dialog`/estado de `ItensSection` já usado pro cadastro** (`cadastroAberto`), só passando `produtoParaEditar` quando é edição — evita duplicar a orquestração de "fechar lista → abrir form → salvar → reabrir lista" que já existe pro fluxo de criação.

## Risks / Trade-offs

- [Risco] Nenhum identificado — reaproveita integralmente componentes e endpoints já testados.
