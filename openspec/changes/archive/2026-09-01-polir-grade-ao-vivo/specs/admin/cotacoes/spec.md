## ADDED Requirements

### Requirement: Apresentação visual refinada da grade ao vivo

A grade ao vivo SHALL apresentar os valores financeiros alinhados à direita, os estados vazios como badges e os preços cotados num formato de cartão consistente, sem alterar os dados ou regras que exibe.

#### Scenario: Colunas financeiras alinhadas à direita

- **WHEN** o Comprador abre a grade com Empresas convidadas
- **THEN** o cabeçalho de cada Empresa e os valores de preço/status nas células ficam alinhados à direita, facilitando a comparação dos centavos

#### Scenario: Estado vazio exibido como badge

- **WHEN** uma célula está `PENDENTE` ou `NAO_COTADO`
- **THEN** o rótulo aparece como uma pílula sutil (fundo claro, texto menor e mais opaco), em vez de texto solto

#### Scenario: Seletor de quantidade visualmente secundário

- **WHEN** a coluna do item exibe o seletor de quantidade `[-]`/`[+]`
- **THEN** os botões têm tamanho, borda e padding reduzidos, ficando visualmente secundários em relação ao nome do item

#### Scenario: Preço cotado padrão em formato de cartão

- **WHEN** uma célula está `COTADO` sem ser o menor preço do item
- **THEN** o preço aparece num bloco com borda fina e fundo branco (`rounded-md`), no mesmo formato de cartão do bloco do menor preço
