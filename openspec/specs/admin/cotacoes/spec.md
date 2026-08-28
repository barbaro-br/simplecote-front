# admin/cotacoes Specification

## Purpose

Interface administrativa do ciclo de vida da Cotação: montar, convidar, abrir, acompanhar as respostas, apurar e ver o resultado. O front exibe e dispara ações; toda regra de estado e apuração é do backend (`simplecote-back/spec.md`).

> **Ainda não coberto aqui**: convidar Empresas / listar participantes / reenviar convite / copiar link mágico, e a correção de lance + reabertura de resposta pelo admin. Esses requisitos vivem na change `admin-cotacoes-participantes-respostas` e dependem de o `simplecote-back` expor `GET /api/cotacoes/{id}/participantes`, a identidade da Empresa em `ParticipanteResponse` e o `participanteId` em `GridAoVivoDTO.Celula`.

## Requirements

### Requirement: Lista de cotações por status
O sistema SHALL exibir, no painel, a lista de Cotações do Comprador (`GET /api/cotacoes`) com título, status e prazo, permitindo filtrar por status, e um atalho para criar uma nova Cotação.

#### Scenario: Painel lista as cotações
- **WHEN** o Comprador acessa o painel
- **THEN** as cotações retornadas pela API aparecem com seu status, e o usuário pode filtrar a lista por um status específico

#### Scenario: Atalho para nova cotação
- **WHEN** o Comprador aciona "Nova cotação"
- **THEN** o sistema abre o formulário de criação

### Requirement: Criar e duplicar Cotação
O sistema SHALL permitir criar uma Cotação informando o título (`POST /api/cotacoes`, nasce em `RASCUNHO`) e SHALL permitir duplicar uma Cotação existente (`POST /api/cotacoes/{id}/duplicar`).

#### Scenario: Criação com sucesso
- **WHEN** o Comprador informa um título válido e confirma
- **THEN** a Cotação é criada em `RASCUNHO` e o sistema navega para o detalhe dela

#### Scenario: Título vazio é bloqueado localmente
- **WHEN** o Comprador tenta criar sem título
- **THEN** o formulário exibe erro de validação e não envia a requisição

#### Scenario: Duplicar cotação anterior
- **WHEN** o Comprador escolhe duplicar uma Cotação existente
- **THEN** uma nova Cotação em `RASCUNHO` é criada a partir dela e o sistema abre seu detalhe

### Requirement: Montar itens da Cotação
O sistema SHALL permitir, enquanto a Cotação está em `RASCUNHO`, adicionar itens escolhendo um Produto do catálogo (`POST /api/cotacoes/{id}/itens`) e remover itens (`DELETE /api/cotacoes/{id}/itens/{itemId}`). Fora de `RASCUNHO` a edição de itens SHALL ficar indisponível.

#### Scenario: Adicionar e remover item em rascunho
- **WHEN** a Cotação está em `RASCUNHO` e o Comprador adiciona um Produto e depois remove um item
- **THEN** a lista de itens reflete cada operação após a resposta da API

#### Scenario: Edição de itens travada fora de rascunho
- **WHEN** a Cotação está `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** os controles de adicionar/remover item não são exibidos ou ficam desabilitados

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação que nomeie a consequência antes de `cancelar` e `apurar` (operações irreversíveis, regra 8 do `spec.md`). O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida.

#### Scenario: Abrir a Cotação
- **WHEN** o Comprador informa um `prazo` e confirma "Abrir"
- **THEN** o sistema chama `POST /{id}/abrir` e a tela passa a refletir o status `ABERTA` e o prazo

#### Scenario: Apurar pede confirmação explícita
- **WHEN** o Comprador aciona "Apurar"
- **THEN** um diálogo descreve a consequência (a apuração não pode ser desfeita; itens sem lance ficam sem vencedor) e só após a confirmação a API é chamada

#### Scenario: Cancelar pede confirmação explícita
- **WHEN** o Comprador aciona "Cancelar"
- **THEN** um diálogo nomeia a consequência antes de a API ser chamada

#### Scenario: Transição inválida mostra o erro do backend
- **WHEN** a API rejeita uma transição (ex.: apurar uma cotação ainda `ABERTA` com pendências que o backend não permite)
- **THEN** a mensagem `ProblemDetail` é exibida e o status na tela não muda

### Requirement: Resultado da apuração e pedidos
O sistema SHALL exibir o resultado de uma Cotação apurada (`GET /api/cotacoes/{id}/resultado`): vencedor por item identificado pelo **nome da Empresa** (não do representante), preço da embalagem e preço unitário derivado que já vêm prontos da API. SHALL listar os pedidos gerados (`GET /api/cotacoes/{id}/pedidos`), permitir enviar um pedido (`POST /api/pedidos/{id}/enviar`), baixar o resultado em XLSX (`GET /api/cotacoes/{id}/resultado.xlsx`) e baixar o PDF de um pedido (`GET /api/pedidos/{id}.pdf`).

#### Scenario: Ver resultado com vencedores por empresa
- **WHEN** o Comprador abre o resultado de uma Cotação `PEDIDOS_GERADOS`
- **THEN** cada item mostra o nome da Empresa vencedora e os preços já calculados pelo backend, sem o front recalcular nada

#### Scenario: Enviar um pedido
- **WHEN** o Comprador aciona "Enviar" num pedido da lista
- **THEN** o sistema chama `POST /api/pedidos/{id}/enviar` e o status do pedido na tela é atualizado

#### Scenario: Baixar exportações
- **WHEN** o Comprador aciona "Baixar XLSX" no resultado ou "Baixar PDF" num pedido
- **THEN** o arquivo binário retornado pela API é entregue ao navegador para download
