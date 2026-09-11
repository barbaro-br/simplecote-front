## ADDED Requirements

### Requirement: Sugestão ao digitar o nome no cadastro

Ao cadastrar um produto novo (não na edição), o sistema SHALL sugerir produtos conforme o usuário digita no campo "Nome do produto" (a partir de 2 caracteres, com debounce), consultando `GET /api/produtos/sugestoes?q=`. A sugestão SHALL trazer dois grupos: produtos já cadastrados pelo próprio Comprador que combinam com o texto ("Já no seu catálogo") e sugestões do catálogo global que o Comprador ainda não tem ("Sugestão da base compartilhada"). O grupo "Já no seu catálogo" SHALL ser somente informativo — nenhuma interação nele preenche o formulário. Escolher uma sugestão do grupo "Sugestão da base compartilhada" SHALL preencher nome e código de barras, nunca tipo de embalagem nem quantidade por embalagem.

#### Scenario: Escolher sugestão do catálogo global preenche nome e código

- **WHEN** o usuário digita parte do nome de um produto que existe no catálogo global e clica na sugestão
- **THEN** os campos "Nome do produto" e "Código de barras" são preenchidos com os dados da sugestão, e uma mensagem confirma que vieram da base compartilhada

#### Scenario: "Já no seu catálogo" é só aviso

- **WHEN** o usuário digita um nome parecido com um produto que ele já tem cadastrado
- **THEN** o produto aparece listado sob "Já no seu catálogo", mas nenhum campo do formulário é alterado por essa listagem

#### Scenario: Sugestão não aparece ao editar um produto existente

- **WHEN** o usuário abre o formulário para editar um produto já cadastrado e altera o nome
- **THEN** nenhum painel de sugestão aparece
