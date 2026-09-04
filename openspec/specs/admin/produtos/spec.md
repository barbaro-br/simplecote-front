# admin/produtos Specification

## Purpose

Gestão do catálogo de produtos pelo Comprador, com suporte a busca automatizada de nomes via Código de Barras (GTIN) para acelerar a criação de cotações.

## Requirements

### Requirement: Listagem do Catálogo
O sistema SHALL listar os produtos cadastrados do Comprador em uma tabela contendo nome, código de barras, embalagem e quantidade por embalagem. O bloco de título/subtítulo/botão "Novo produto" SHALL permanecer fixo no topo da tela ao rolar a lista, e a linha de cabeçalho de colunas da tabela (Nome/Código de barras/Embalagem/Qtd./Ações) SHALL permanecer visível ao rolar a lista de produtos, mesmo com um catálogo grande — a tabela SHALL ter seu próprio contêiner de rolagem vertical para esse fim, no mesmo padrão já usado pela grade ao vivo da tela de Cotação. A coluna de quantidade por embalagem e a coluna de Ações SHALL ter separação visual clara entre si (não coladas), e as ações de inativar/ativar de cada linha SHALL usar ícones que representem "arquivar"/"desarquivar" o produto. A barra de rolagem desse contêiner SHALL usar uma aparência estilizada consistente com os tokens de cor do tema (claro e escuro), em vez da aparência padrão do navegador.

#### Scenario: Visualização do Catálogo
- **WHEN** o usuário acessa a página de produtos
- **THEN** a lista de produtos carregada via API é exibida em formato tabular

#### Scenario: Cabeçalho da página permanece visível ao rolar

- **WHEN** o usuário rola a lista de produtos com um catálogo grande (ex.: 200+ itens)
- **THEN** o título "Catálogo de produtos", o subtítulo e o botão "Novo produto" permanecem visíveis no topo da tela

#### Scenario: Cabeçalho de colunas da tabela permanece visível ao rolar

- **WHEN** o usuário rola a lista de produtos dentro da tabela
- **THEN** a linha de cabeçalho de colunas (Nome/Código de barras/Embalagem/Qtd./Ações) permanece visível no topo da área da tabela, sem sobrepor o cabeçalho fixo da página

#### Scenario: Barra de rolagem estilizada

- **WHEN** o catálogo tem itens suficientes para exibir a barra de rolagem do contêiner da tabela
- **THEN** a barra de rolagem aparece fina, com trilho transparente e "polegar" na cor de borda do tema, em vez da barra de rolagem padrão do navegador

### Requirement: Cadastro de Novo Produto
O sistema SHALL permitir o cadastro de um novo produto solicitando nome, código de barras opcional, tipo de embalagem e quantidade por embalagem.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário corretamente e salva
- **THEN** o produto é criado via API, o formulário é fechado, e a listagem é atualizada

#### Scenario: Erro de validação local
- **WHEN** o usuário tenta salvar com nome vazio ou quantidade menor que 1
- **THEN** a interface exibe erros locais de validação abaixo dos campos sem enviar a requisição

### Requirement: Inativação de Produto
O sistema SHALL listar os produtos do Comprador incluindo os inativos, exibindo cada linha inativa com aparência apagada (cinza), e SHALL oferecer, por linha, uma ação que **inativa** o produto ativo (`POST /api/produtos/{id}/inativar`) ou **reativa** o produto inativo (`POST /api/produtos/{id}/ativar`), conforme o estado atual. As ações SHALL ser apresentadas como ícones com dica (tooltip) no hover, e a linha inteira sob o cursor SHALL ganhar destaque visual.

#### Scenario: Inativar produto
- **WHEN** o usuário aciona "Inativar" na linha de um produto ativo
- **THEN** a inativação é solicitada à API e a lista recarrega, com o produto passando a aparecer como inativo

#### Scenario: Reativar produto
- **WHEN** o usuário aciona "Ativar" na linha de um produto inativo
- **THEN** a reativação é solicitada à API e a lista recarrega, com o produto de volta ao estado ativo

#### Scenario: Ação depende do estado da linha
- **WHEN** a lista tem produtos ativos e inativos
- **THEN** a linha ativa oferece "Inativar" e a linha inativa oferece "Ativar", nunca as duas

### Requirement: Consulta externa por Código de Barras (GTIN)
O sistema SHALL permitir uma busca do nome do Produto via API (`GET /api/produtos/lookup?gtin=`) para preencher o formulário automaticamente a partir de provedores externos. O campo de código de barras SHALL disparar essa busca também ao pressionar Enter (não só ao clicar em "Buscar"), sem submeter o formulário — comportamento necessário para leitores de código de barras físicos, que digitam os dígitos e finalizam com Enter.

#### Scenario: Consulta com sucesso
- **WHEN** o usuário digita o código de barras e clica em buscar
- **THEN** o nome do produto retornado pelo provedor é preenchido no formulário

#### Scenario: Produto não encontrado
- **WHEN** a busca do código de barras não encontra correspondência
- **THEN** o sistema falha silenciosamente (degrada graciosamente) sem travar o cadastro manual

#### Scenario: Enter no campo aciona a busca, não o submit

- **WHEN** o usuário está com foco no campo de código de barras e pressiona Enter (ex.: leitor de código de barras físico que finaliza a leitura com Enter)
- **THEN** a busca do GTIN é acionada como se o botão "Buscar" tivesse sido clicado, e o formulário NÃO SHALL ser submetido

### Requirement: Atualização de Produto
O sistema SHALL permitir a edição dos dados cadastrais (nome, código de barras, embalagem, quantidade por embalagem) de um Produto existente no catálogo (`PUT /api/produtos/{id}`).

#### Scenario: Edição bem-sucedida
- **WHEN** o usuário clica em "Editar" um produto e altera sua embalagem
- **THEN** as alterações são salvas e a listagem exibe a nova configuração do produto

### Requirement: Busca no Catálogo
A tela de Catálogo de produtos SHALL exibir um campo de busca no topo, acima da tabela, com placeholder indicando que a busca é por nome ou código de barras. Digitar no campo SHALL filtrar a lista exibida, em tempo real (sem necessidade de confirmar/pressionar Enter), comparando o texto digitado (sem diferenciar maiúsculas/minúsculas, nem acentuação) contra o nome do produto e contra o código de barras. A busca SHALL operar sobre a lista de produtos já carregada pela tela (client-side), sem disparar nova chamada de API. Limpar o campo SHALL restaurar a lista completa. Quando nenhum produto corresponder ao termo buscado, a tabela SHALL exibir um estado vazio informando que nenhum produto foi encontrado para aquele termo, distinto do estado vazio de "nenhum produto cadastrado".

#### Scenario: Buscar por nome
- **WHEN** o usuário digita parte do nome de um produto no campo de busca
- **THEN** a tabela passa a exibir apenas os produtos cujo nome contém o termo digitado

#### Scenario: Buscar por código de barras
- **WHEN** o usuário digita um código de barras (completo ou parcial) no campo de busca
- **THEN** a tabela passa a exibir apenas os produtos cujo código de barras contém o termo digitado

#### Scenario: Busca sem diferenciar maiúsculas/minúsculas ou acentos
- **WHEN** o usuário digita um termo sem acentuação ou com capitalização diferente do nome cadastrado (ex.: "acucar" para "Açúcar")
- **THEN** os produtos correspondentes aparecem normalmente na lista filtrada

#### Scenario: Limpar a busca restaura a lista completa
- **WHEN** o usuário apaga o conteúdo do campo de busca
- **THEN** a tabela volta a exibir todos os produtos do catálogo

#### Scenario: Nenhum resultado para o termo buscado
- **WHEN** o termo digitado não corresponde a nenhum produto do catálogo
- **THEN** a tabela exibe um estado vazio específico informando que nenhum produto foi encontrado para a busca
