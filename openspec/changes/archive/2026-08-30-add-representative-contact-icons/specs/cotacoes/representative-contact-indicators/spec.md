## Purpose

Fornece indicadores visuais sobre a disponibilidade de canais de contato (e-mail e WhatsApp) para os representantes durante a seleção em uma cotação.

## ADDED Requirements

### Requirement: Indicador de E-mail
O sistema SHALL exibir um indicador visual de E-mail ao lado do nome do representante na lista de seleção caso o representante possua um e-mail cadastrado.

#### Scenario: Representante com e-mail cadastrado
- **WHEN** o representante possui o campo e-mail preenchido em seu cadastro
- **THEN** um ícone de e-mail é exibido próximo ao seu nome na lista de seleção de representantes da cotação

#### Scenario: Representante sem e-mail cadastrado
- **WHEN** o representante não possui o campo e-mail preenchido
- **THEN** nenhum ícone de e-mail é exibido

### Requirement: Indicador de WhatsApp
O sistema SHALL exibir um indicador visual de WhatsApp ao lado do nome do representante na lista de seleção caso o representante possua um WhatsApp cadastrado.

#### Scenario: Representante com WhatsApp cadastrado
- **WHEN** o representante possui o campo whatsapp preenchido em seu cadastro
- **THEN** um ícone de WhatsApp é exibido próximo ao seu nome na lista de seleção de representantes da cotação

#### Scenario: Representante sem WhatsApp cadastrado
- **WHEN** o representante não possui o campo whatsapp preenchido ou está vazio
- **THEN** nenhum ícone de WhatsApp é exibido
