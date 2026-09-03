# cotacoes/abrir-cotacao-modal Specification

## Purpose
Modal "Abrir Cotação" que o Comprador usa para definir o prazo de resposta antes de lançar uma Cotação `RASCUNHO` para `ABERTA`, com presets rápidos de prazo e a opção de escolher data/hora personalizadas.

## Requirements

### Requirement: Definição de Prazo da Cotação
O sistema SHALL permitir que o usuário defina o prazo de respostas da cotação. Presets de prazo (ex.: "Hoje às 18h") cujo horário resultante já esteja no passado no momento em que o modal é exibido SHALL aparecer desabilitados (não clicáveis, com indicação visual de indisponível), em vez de aparentar disponíveis e só falhar depois do clique em confirmar. O preset selecionado por padrão ao abrir o modal SHALL ser o primeiro preset, na ordem em que são exibidos, cujo horário ainda esteja no futuro.

#### Scenario: Seleção em duas etapas (Data Personalizada)
- **WHEN** o usuário clica em "Data Personalizada" no modal "Abrir Cotação"
- **THEN** o modal altera sua visualização principal (escondendo os presets) para exibir o Calendário e Seletor de Hora.
- **AND** após confirmar no calendário, a visualização retorna para os presets, mantendo a data personalizada salva na memória.

#### Scenario: Preset já vencido aparece desabilitado

- **WHEN** o usuário abre o modal "Abrir Cotação" depois do horário de um preset fixo (ex.: depois das 18h, em relação ao preset "Hoje às 18h")
- **THEN** esse preset aparece desabilitado, sem poder ser selecionado, e não é o preset escolhido por padrão

#### Scenario: Preset padrão é sempre um horário futuro

- **WHEN** o usuário abre o modal "Abrir Cotação" em qualquer horário do dia
- **THEN** o preset pré-selecionado ao abrir o modal é sempre um horário no futuro, nunca um preset já vencido
