## Purpose

Completa a interface administrativa da Cotação com o convite de Empresas e a intervenção do Comprador nas respostas (correção de lance, reabertura). Depende de o `simplecote-back` expor a leitura de participantes e a ligação `participanteId` na grade de respostas. O front exibe e dispara ações; toda regra de estado é do backend.

## ADDED Requirements

### Requirement: Convidar Empresas

O sistema SHALL permitir selecionar uma ou mais Empresas ativas do Comprador e convidá-las para a Cotação (`POST /api/cotacoes/{id}/participantes` com `empresaIds`), listar os participantes com seu status de convite (a partir de `GET /api/cotacoes/{id}/participantes`), reenviar o convite de um participante (`POST /api/participantes/{participanteId}/reenviar-convite`) e copiar o link mágico do participante.

#### Scenario: Convite de empresas

- **WHEN** o Comprador seleciona duas Empresas e confirma o convite
- **THEN** os participantes passam a aparecer na lista com o status de convite retornado pela API

#### Scenario: Reenviar convite

- **WHEN** o Comprador aciona "Reenviar" num participante
- **THEN** o sistema chama a API de reenvio e reflete o novo status/instante do convite

#### Scenario: Erro de convite é exibido

- **WHEN** a API rejeita o convite (ex.: Empresa sem representante, cotação fora de `RASCUNHO`)
- **THEN** a mensagem `ProblemDetail` do backend é exibida, sem alterar a lista

#### Scenario: Lista de participantes sobrevive a um recarregamento

- **WHEN** o Comprador recarrega a tela de detalhe de uma Cotação que já tem participantes
- **THEN** a lista de participantes e seus status de convite são carregados de `GET /api/cotacoes/{id}/participantes`

### Requirement: Correção de lance e reabertura de resposta pelo admin

O sistema SHALL permitir ao Comprador corrigir diretamente o lance de um participante para um item (`PUT /api/participantes/{participanteId}/lances/{itemId}`) e reabrir a resposta de um participante `RESPONDIDO` (`POST /api/participantes/{participanteId}/reabrir`), a partir da tela de detalhe da Cotação. A grade de respostas é lida de `GET /api/cotacoes/{id}/ao-vivo` sem polling (o polling é Fase 2).

#### Scenario: Admin corrige um lance

- **WHEN** o Comprador edita o preço (ou marca não cotado) de um lance de um participante e confirma
- **THEN** o sistema chama a API de correção e a grade de respostas reflete o novo valor

#### Scenario: Admin reabre a resposta de um participante

- **WHEN** o Comprador aciona "Reabrir resposta" num participante `RESPONDIDO`
- **THEN** o sistema chama a API e o participante volta a aparecer como editável pelo representante
