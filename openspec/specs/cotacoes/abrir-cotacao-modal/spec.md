# cotacoes/abrir-cotacao-modal Specification

## Purpose
Modal "Abrir Cotação" que o Comprador usa para definir o prazo de resposta antes de lançar uma Cotação `RASCUNHO` para `ABERTA`, com presets rápidos de prazo e a opção de escolher data/hora personalizadas.

## Requirements

### Requirement: Definição de Prazo da Cotação

O sistema SHALL permitir que o usuário defina o prazo de respostas da cotação. Os presets SHALL cobrir os casos comuns: `+24h`, `+48h`, "hoje às 18h", "amanhã às 18h" e "sexta às 12h" — este último exibido apenas de segunda a quinta. Presets cujo horário resultante já esteja no passado no momento em que o modal é exibido SHALL aparecer desabilitados (não clicáveis, com indicação visual de indisponível), em vez de aparentar disponíveis e só falhar depois do clique em confirmar. O preset selecionado por padrão ao abrir o modal SHALL ser o primeiro preset, na ordem em que são exibidos, cujo horário ainda esteja no futuro. As visualizações de presets e de Data Personalizada dentro do modal SHALL ter a mesma altura mínima, de modo que alternar entre elas não cause um salto visual perceptível no tamanho do modal.

O cálculo do prazo SHALL ser ancorado no fuso `America/Sao_Paulo`, não no fuso do navegador do usuário, e o valor enviado à API SHALL continuar em ISO-8601 UTC. Antes da confirmação, o modal SHALL exibir sempre o prazo resultante já formatado em pt-BR (ex.: "Expira sábado, 06/09 às 18:00 (horário de Brasília)"), atualizando quando o usuário troca de preset ou ajusta a data personalizada.

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

#### Scenario: Alternar visualização não muda a altura do modal

- **WHEN** o usuário alterna entre a visualização de presets e a de Data Personalizada (em qualquer direção)
- **THEN** o modal mantém a mesma altura mínima nas duas visualizações, sem salto visual perceptível de tamanho

#### Scenario: Preset "sexta às 12h" só de segunda a quinta

- **WHEN** o usuário abre o modal numa sexta, sábado ou domingo
- **THEN** o preset "sexta às 12h" não é exibido

#### Scenario: Prévia do prazo resultante

- **WHEN** o usuário seleciona um preset ou ajusta a data personalizada
- **THEN** o modal mostra, antes de confirmar, o prazo resultante formatado em pt-BR e no fuso America/Sao_Paulo, e a prévia muda ao trocar de opção

#### Scenario: Cálculo no fuso de São Paulo

- **WHEN** o navegador do usuário está num fuso diferente de America/Sao_Paulo e ele escolhe "hoje às 18h"
- **THEN** o prazo enviado corresponde às 18h de São Paulo daquele dia (convertido para UTC no envio), não às 18h do fuso do navegador
