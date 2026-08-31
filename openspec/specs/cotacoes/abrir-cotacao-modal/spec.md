# cotacoes/abrir-cotacao-modal Specification

## Purpose
TBD - created by archiving change redesign-abrir-cotacao-step2. Update Purpose after archive.

## Requirements

### Requirement: Definição de Prazo da Cotação
O sistema SHALL permitir que o usuário defina o prazo de respostas da cotação.

#### Scenario: Seleção em duas etapas (Data Personalizada)
- **WHEN** o usuário clica em "Data Personalizada" no modal "Abrir Cotação"
- **THEN** o modal altera sua visualização principal (escondendo os presets) para exibir o Calendário e Seletor de Hora.
- **AND** após confirmar no calendário, a visualização retorna para os presets, mantendo a data personalizada salva na memória.
