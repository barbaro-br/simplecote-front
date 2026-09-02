# shared/design-system Specification

## Purpose

Define o contrato da linguagem visual compartilhada do SimpleCote: cores semânticas por token (nunca cores cruas), tipografia tabular para números, paleta cromática de gráficos, respeito à preferência de redução de movimento e identidade de marca consistente, garantindo legibilidade nos temas claro e escuro.

## Requirements

### Requirement: Cores de estado sempre por token semântico
Toda cor que expressa estado (sucesso, aviso, erro, informação) SHALL ser aplicada via token semântico do tema (`success`, `warning`, `destructive`, `info`) e MUST permanecer legível tanto no tema claro quanto no escuro.

#### Scenario: Status legível no tema escuro
- **WHEN** o usuário ativa o tema escuro e a tela exibe um status (ex.: "salvo", "sem conexão", erro de ação)
- **THEN** o texto e o fundo do estado mantêm contraste suficiente, sem cores de paleta fixa (ex.: `green-600`, `amber-200`) que estourem no fundo escuro

#### Scenario: Mensagem de aviso no tema claro
- **WHEN** um diálogo exibe um aviso (ex.: itens sem preço antes de finalizar)
- **THEN** o aviso usa o token `warning` com primeiro plano legível sobre fundo claro

### Requirement: Paleta de gráficos cromática
A aplicação SHALL fornecer uma paleta de gráficos (`chart-1..5`) com cores distintas entre si, de modo que séries de dados sejam visualmente diferenciáveis.

#### Scenario: Séries de dados distinguíveis
- **WHEN** um gráfico ou sparkline renderiza mais de uma série
- **THEN** cada série usa uma cor cromática distinta, não tons de cinza indistinguíveis

### Requirement: Alinhamento tabular de números
Campos que exibem números ou valores monetários SHALL usar algarismos tabulares (`tabular-nums`), de modo que colunas e listas de preço alinhem os dígitos verticalmente.

#### Scenario: Coluna de preços alinhada
- **WHEN** uma tabela ou lista exibe preços/prazos em várias linhas
- **THEN** os dígitos ficam alinhados na vertical independentemente do comprimento do valor

### Requirement: Respeito à preferência de reduzir movimento
Animações e transições MUST ser reduzidas ou desativadas quando o usuário sinaliza preferência por movimento reduzido.

#### Scenario: Sistema com movimento reduzido
- **WHEN** o ambiente sinaliza `prefers-reduced-motion: reduce`
- **THEN** as microanimações e transições da interface são minimizadas ou desativadas, sem impedir o uso

### Requirement: Identidade de marca consistente
A tela de login SHALL apresentar a identidade da marca SimpleCote, sem nome de cliente embutido no código.

#### Scenario: Tela de login com marca correta
- **WHEN** o usuário abre a tela de login
- **THEN** o título exibe a marca "SimpleCote", e nenhum nome de supermercado/cliente específico aparece como identidade do produto
