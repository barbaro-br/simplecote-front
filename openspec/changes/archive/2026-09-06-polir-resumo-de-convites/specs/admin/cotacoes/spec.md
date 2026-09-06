## ADDED Requirements

### Requirement: Resumo da entrega de convites e mensagem de WhatsApp padronizada

Na tela de detalhe da Cotação, quando o status é `ABERTA` ou `ENCERRADA` e há participantes, o sistema SHALL exibir no cabeçalho um resumo "N de M convites entregues" (M = total de participantes, N = participantes com `conviteStatus` igual a `ENVIADO`). Quando N é menor que M, o sistema SHALL oferecer uma ação que abre o modal de Representantes (onde já é possível reenviar). O resumo SHALL NÃO aparecer em `RASCUNHO`.

O botão de compartilhar por WhatsApp (no modal de Representantes) SHALL montar a mensagem pelo helper `montarMensagemConvite` — saudando o representante pelo nome e citando o título da cotação, a empresa e o prazo — em vez de um texto genérico de uma linha.

#### Scenario: Resumo de entrega no cabeçalho

- **WHEN** a tela de detalhe abre uma Cotação `ABERTA` com 4 participantes, 3 com convite `ENVIADO` e 1 com `FALHOU`
- **THEN** o cabeçalho mostra "3 de 4 convites entregues" e uma ação que abre o modal de Representantes

#### Scenario: Sem resumo em rascunho

- **WHEN** a Cotação está em `RASCUNHO`
- **THEN** o resumo de entrega de convites não é exibido

#### Scenario: Mensagem de WhatsApp usa o helper

- **WHEN** o admin aciona o botão de WhatsApp de um representante
- **THEN** o link `wa.me` gerado contém a mensagem do `montarMensagemConvite` — com o nome do representante, o título da cotação e o link mágico
