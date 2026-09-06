## ADDED Requirements

### Requirement: Cabeçalho fixo na tela do colaborador

O cabeçalho da tela do colaborador (título da cotação selecionada e nome da loja) SHALL permanecer fixo no topo da viewport enquanto a lista de produtos é rolada, mantendo-se visível e legível em telas estreitas em modo retrato.

#### Scenario: Scroll mantém o cabeçalho visível
- **WHEN** o colaborador rola a lista de produtos numa tela estreita (celular, retrato)
- **THEN** o cabeçalho (cotação/loja) permanece fixo no topo e o restante do conteúdo rola por baixo dele

### Requirement: Cadastro de produto sem bipar

O sistema SHALL permitir ao colaborador cadastrar um novo produto (nome, unidade, quantidade por embalagem e quantidade) e adicioná-lo à cotação aberta **sem** precisar bipar um código de barras — a partir de uma ação explícita "Cadastrar produto" sempre visível na tela, independente do fluxo de bipagem.

#### Scenario: Cadastrar sem bipar
- **WHEN** o colaborador aciona "Cadastrar produto", preenche nome, unidade, quantidade por embalagem e quantidade, e confirma
- **THEN** o item é criado e adicionado à cotação aberta, com a mesma confirmação de sucesso dos demais fluxos de adição

#### Scenario: Cadastro com dados inválidos
- **WHEN** o colaborador tenta cadastrar sem preencher nome (ou com quantidade/qtd-embalagem inválidas)
- **THEN** o sistema bloqueia o envio e exibe mensagens de erro nos campos, sem criar o item
