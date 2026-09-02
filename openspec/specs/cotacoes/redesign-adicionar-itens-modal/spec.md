# cotacoes/redesign-adicionar-itens-modal Specification

## Purpose
Melhora drasticamente a experiência de inclusão de itens na cotação. O modal pequeno de "Adicionar item" com um dropdown (select) será substituído por um modal grande de seleção em massa (estilo lista), com busca nativa, permitindo fluxo contínuo.

## Requirements

### Requirement: Seleção otimizada de itens
O sistema SHALL exibir um modal de listagem em vez de um `<select>` para adição de novos itens.

#### Scenario: Abrir seleção de itens
- **WHEN** o usuário clica em "Adicionar item" na listagem de itens da cotação
- **THEN** o modal "Adicionar Produtos" se abre exibindo todos os produtos ativos do sistema em forma de lista
- **AND** a lista de produtos tem uma barra de busca (por nome)

#### Scenario: Buscar itens
- **WHEN** o usuário digita no campo de busca do modal
- **THEN** a lista é instantaneamente filtrada mostrando apenas produtos que contenham aquele texto

#### Scenario: Inclusão instantânea
- **WHEN** o usuário clica em um produto na lista
- **THEN** o produto é adicionado imediatamente à cotação com quantidade 1 (fluxo "one-click")
- **AND** se o usuário quiser, pode ajustar a quantidade depois diretamente na tabela de itens (comportamento já suportado)
- **AND** o estado visual do produto no modal muda para indicar que já foi selecionado (ex: checkbox marcado e/ou bloqueado para re-adição, ou opcionalmente desmarca e remove da cotação)

### Requirement: Link de cadastro de produto
O sistema SHALL manter o acesso rápido ao cadastro de produtos dentro deste novo modal.

#### Scenario: Produto não encontrado
- **WHEN** a busca não retorna resultados (ou mesmo listando)
- **THEN** deve haver um botão claro de "Cadastrar novo produto" acessível
