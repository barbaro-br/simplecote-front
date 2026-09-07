# cotacoes/abrir-cotacao-modal Specification

## Purpose
Modal "Abrir Cotação" que o Comprador usa para definir o prazo de resposta antes de lançar uma Cotação `RASCUNHO` para `ABERTA`, com presets rápidos de prazo e a opção de escolher data/hora personalizadas.

## Requirements

### Requirement: Seleção de prazo por calendário

O modal "Abrir Cotação" SHALL abrir direto numa visão de calendário (seleção de dia) com seletores de hora e minuto, sem presets e sem alternância de visões. A data pré-selecionada SHALL ser uma data futura sensata (amanhã por padrão) e a hora padrão `18:00`. O cálculo do prazo SHALL ser ancorado no fuso `America/Sao_Paulo`, com a saída em ISO-8601 UTC. Antes de confirmar, o modal SHALL exibir sempre o prazo resultante formatado em pt-BR (ex.: "Expira sábado, 06/09 às 18:00 (horário de Brasília)"), atualizando quando o usuário troca o dia ou a hora. Confirmar com um prazo no passado SHALL ser bloqueado com uma mensagem, sem chamar a abertura.

#### Scenario: Abre no calendário com data padrão

- **WHEN** o usuário aciona "Abrir" numa cotação
- **THEN** o modal mostra o calendário com um dia futuro pré-selecionado e a hora `18:00`, e a prévia do prazo formatado

#### Scenario: Trocar dia ou hora atualiza a prévia

- **WHEN** o usuário escolhe outro dia ou muda a hora
- **THEN** a prévia do prazo formatado muda de acordo

#### Scenario: Prazo no passado é bloqueado

- **WHEN** o usuário seleciona um dia/hora que já passou e confirma
- **THEN** o modal mostra uma mensagem de "prazo precisa ser no futuro" e não abre a cotação

#### Scenario: Cálculo no fuso de São Paulo

- **WHEN** o navegador do usuário está num fuso diferente de America/Sao_Paulo e ele escolhe um dia às 18:00
- **THEN** o prazo enviado corresponde às 18:00 de São Paulo daquele dia (convertido para UTC no envio)
