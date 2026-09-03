## 1. ItensSection: estado de edição

- [x] 1.1 Em `ItensSection.tsx`: adicionar estado `produtoParaEditar: Produto | undefined`.
- [x] 1.2 Nova função `abrirEdicao(produto: Produto)`: fecha `formAberto` (`setFormAberto(false)`), guarda `produto` em `produtoParaEditar`, abre `cadastroAberto` (`setCadastroAberto(true)`) — mesmo padrão de `abrirCadastro()` já existente.
- [x] 1.3 No `<Dialog>` que já renderiza `<ProdutoForm aoSalvar={aoCadastrarProduto} />` (linha ~142-149): passar também `produtoParaEditar={produtoParaEditar}`.
- [x] 1.4 Ajustar `aoCadastrarProduto` (chamado tanto ao criar quanto ao editar, via `aoSalvar` do `ProdutoForm`): limpar `produtoParaEditar` (`setProdutoParaEditar(undefined)`) além de reabrir `formAberto`.
- [x] 1.5 Passar `aoEditarProduto={abrirEdicao}` pro `AdicionarItemModal`.

## 2. AdicionarItemModal: ação de editar por linha

- [x] 2.1 Adicionar prop `aoEditarProduto: (produto: Produto) => void` ao componente.
- [x] 2.2 Em cada `<li>` da lista (linha ~204-276): adicionar um botão/ícone de editar (ex.: `Pencil` do `lucide-react`), com `onClick` que chama `ev.stopPropagation()` (não deve disparar o `handleToggle` da linha) e depois `onClose()` seguido de `aoEditarProduto(p)`.

## 3. Testes

- [x] 3.1 Teste: clicar no ícone de editar dentro do modal de adicionar item abre o `ProdutoForm` pré-preenchido com os dados do produto clicado.
- [x] 3.2 Teste: salvar a edição atualiza os dados exibidos na lista de produtos (nome/embalagem), sem sair da tela de montagem da Cotação.
- [x] 3.3 Teste: clicar no ícone de editar não marca/desmarca o produto na Cotação (não dispara `handleToggle`).
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
