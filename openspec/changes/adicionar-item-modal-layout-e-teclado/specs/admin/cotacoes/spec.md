## MODIFIED Requirements

### Requirement: Sugestão do catálogo global no modal "Adicionar Produtos"

Quando a busca no modal "Adicionar Produtos" não encontrar nenhum produto no catálogo do próprio Comprador, o sistema SHALL consultar sugestões do catálogo global (mesmo endpoint da sugestão de cadastro, `admin/produtos`) pelo mesmo texto buscado e exibi-las como opção complementar ao "Cadastrar novo produto" já existente, usando o mesmo layout de linha (ícone, nome, subtítulo, botão de ação) da lista do próprio catálogo. Escolher uma sugestão do catálogo global SHALL abrir o cadastro de produto novo já com nome e código de barras preenchidos, deixando tipo de embalagem e quantidade para o admin completar. Encontrar algum produto no catálogo do próprio Comprador SHALL dispensar a consulta ao catálogo global. A lista visível (a do próprio catálogo, ou a sugestão do catálogo global quando aquela estiver vazia) SHALL aceitar navegação por teclado no campo de busca: seta cima/baixo move um item ativo destacado, e Enter aciona esse item (adiciona/remove no próprio catálogo, cadastra e adiciona na sugestão do catálogo global).

#### Scenario: Sem match local, sugestão do catálogo global aparece

- **WHEN** o admin busca um termo que não existe no seu catálogo, mas existe no catálogo global
- **THEN** a sugestão do catálogo global aparece no estado vazio, com o mesmo layout de linha da lista do próprio catálogo, junto com a opção de cadastrar do zero

#### Scenario: Escolher a sugestão abre o cadastro pré-preenchido

- **WHEN** o admin clica numa sugestão do catálogo global
- **THEN** o formulário de cadastro de produto novo abre com nome e código de barras já preenchidos, sem tipo de embalagem nem quantidade

#### Scenario: Achar no próprio catálogo não busca o catálogo global

- **WHEN** a busca encontra pelo menos um produto no catálogo do próprio Comprador
- **THEN** nenhuma consulta ao catálogo global é feita

#### Scenario: Navegar e selecionar por teclado

- **WHEN** o admin usa a seta pra baixo no campo de busca até destacar um item da lista visível e pressiona Enter
- **THEN** o item destacado é acionado (adicionado/removido no próprio catálogo, ou cadastrado e adicionado na sugestão do catálogo global), sem precisar do mouse
