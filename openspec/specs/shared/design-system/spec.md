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
A tela de login SHALL apresentar o nome da loja configurado (via `admin/configuracoes`), lido de dado, em vez de uma marca fixa embutida no código. A tela de login e o rodapé da sidebar administrativa SHALL exibir um crédito de desenvolvedor discreto (texto pequeno, cor de baixo contraste), definido numa única constante compartilhada para fácil edição. No rodapé da sidebar, o crédito SHALL seguir o mesmo comportamento de recolher/expandir já usado pelos demais rótulos da sidebar (escondido quando a sidebar está no modo ícone).

#### Scenario: Tela de login com marca correta
- **WHEN** o usuário abre a tela de login
- **THEN** o título exibe o nome da loja configurado (ex.: "Sara Supermercado"), lido da Configuração da loja, em vez de um valor fixo no código

#### Scenario: Configuração ainda carregando
- **WHEN** a tela de login abre antes de a configuração da loja terminar de carregar
- **THEN** a tela exibe um estado de carregamento aceitável (ex.: skeleton), sem quebrar o layout ou expor um nome incorreto

#### Scenario: Crédito de desenvolvedor na tela de login

- **WHEN** o usuário abre a tela de login
- **THEN** um texto discreto de crédito de desenvolvedor aparece abaixo do link "Esqueci minha senha", sem competir visualmente com o formulário

#### Scenario: Crédito de desenvolvedor no rodapé da sidebar

- **WHEN** o admin visualiza a sidebar expandida
- **THEN** um texto discreto de crédito de desenvolvedor aparece abaixo do botão "Sair"

#### Scenario: Crédito some com a sidebar recolhida

- **WHEN** a sidebar está recolhida no modo ícone
- **THEN** o crédito de desenvolvedor não é exibido (mesmo comportamento do rótulo "Sair" nesse estado)

### Requirement: Neutros do tema claro com viés cromático sutil

Os tokens de superfície do tema claro (`--background`, `--card`, `--border`, `--input`) SHALL usar um leve viés de matiz alinhado ao `--primary` da marca, em vez de serem puramente acromáticos (chroma ≈0) — um neutro combinado de propósito com o tom de destaque, não um cinza/branco genérico. O mesmo conjunto de valores SHALL ser usado tanto no tema claro padrão (`:root`) quanto no tema claro forçado da tela pública do representante (`.tema-claro`), mantendo os dois visualmente equivalentes. O tema escuro (`.dark`) não é afetado por este requirement.

#### Scenario: Fundo do painel com viés de matiz da marca

- **WHEN** o admin visualiza qualquer tela do painel no tema claro
- **THEN** o fundo da página e dos cartões usam uma cor neutra com leve viés de matiz na mesma família do `--primary`, não um branco ou cinza puramente acromático

#### Scenario: Tema claro forçado do representante acompanha o mesmo fundo

- **WHEN** o representante acessa a tela pública por token (`.tema-claro`)
- **THEN** o fundo usa os mesmos valores de `--background`/`--card`/`--border`/`--input` do tema claro do painel admin

### Requirement: Componente padronizado de mensagem de erro

Mensagens de erro de ação (falha ao excluir, cancelar, ou qualquer operação disparada pelo usuário que a API rejeite) SHALL usar um componente compartilhado de alerta com fundo (`bg-destructive/10`), borda (`border-destructive/30`) e ícone de alerta — não texto solto sem contorno visual. `CotacoesPage` (lista de Cotações) e `CotacaoDetalhePage` (detalhe da Cotação) SHALL usar esse componente compartilhado para suas mensagens de erro de ação.

#### Scenario: Erro de ação na lista de Cotações usa o alerta padronizado

- **WHEN** uma ação na lista de Cotações (ex.: excluir) falha e a API retorna erro
- **THEN** a mensagem de erro aparece dentro do componente de alerta padronizado (fundo, borda, ícone), não como texto solto

#### Scenario: Erro de ação no detalhe da Cotação usa o alerta padronizado

- **WHEN** uma ação na tela de detalhe da Cotação falha e a API retorna erro
- **THEN** a mensagem de erro aparece dentro do componente de alerta padronizado (fundo, borda, ícone), não como texto solto

### Requirement: Seleção de tema claro/escuro

O sistema SHALL permitir alternar entre o tema claro (padrão) e o tema escuro (`.dark`, já especificado em tokens CSS) via configuração persistida por Comprador (`tema`, `CLARO`/`ESCURO`), aplicada em todas as rotas `/admin/**` para todos os usuários dessa loja — não é uma preferência por usuário. A aplicação SHALL ocorrer num único ponto de bootstrap (`ConfiguracaoLojaProvider`), alternando a classe `dark` no elemento raiz do documento.

#### Scenario: Tema escuro aplicado a todas as rotas

- **WHEN** a configuração do Comprador tem `tema: 'ESCURO'`
- **THEN** todas as rotas `/admin/**` exibem os tokens de cor do tema escuro, para qualquer usuário dessa loja

#### Scenario: Tema claro é o padrão

- **WHEN** a configuração do Comprador não define `tema` explicitamente (Comprador novo)
- **THEN** o painel exibe o tema claro
