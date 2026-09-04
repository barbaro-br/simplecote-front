## MODIFIED Requirements

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
