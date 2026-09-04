## MODIFIED Requirements

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
