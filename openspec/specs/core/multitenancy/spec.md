# core/multitenancy Specification

## Purpose
Define como o front do SimpleCote se comporta diante de um backend multi-inquilino: a identidade do `Comprador` (tenant) é sempre resolvida no servidor a partir do JWT, o cliente nunca a transporta nem a deixa escolher, e as rotas públicas por token têm seu inquilino resolvido pelo token.

## Requirements

### Requirement: Identidade de inquilino resolvida apenas no servidor

Toda requisição a `/api/**` SHALL carregar exclusivamente o JWT da sessão como prova de identidade do inquilino; o front SHALL NOT enviar `compradorId` (ou qualquer sinônimo de identificador de `Comprador`) no corpo, na query string ou no path, e SHALL NOT oferecer ao usuário uma forma de escolher ou digitar o inquilino de uma operação. Nenhum valor derivado de domínio (incluindo o inquilino) SHALL ser calculado no cliente.

#### Scenario: Mutação de admin não transporta o inquilino

- **WHEN** o admin cria um produto, cria uma empresa, abre uma cotação ou salva as configurações da loja
- **THEN** o payload enviado ao backend não contém nenhum campo de identificação de `Comprador` — o servidor resolve o inquilino pelo JWT

#### Scenario: Não há seletor de inquilino na UI

- **WHEN** o admin percorre qualquer tela do painel autenticado
- **THEN** não existe campo, menu ou parâmetro que permita escolher em nome de qual `Comprador` a operação ocorre

### Requirement: Rotas públicas por token resolvem o inquilino pelo token

As rotas públicas (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token` e as chamadas `/public/**`) SHALL ser anônimas: nunca enviam o JWT do admin. O inquilino dessas telas SHALL ser resolvido pelo backend a partir do token da URL, e o front SHALL NOT tentar inferir ou exibir o `Comprador` por outro meio.

#### Scenario: Tela pública não vaza sessão de admin

- **WHEN** um representante ou colaborador abre uma rota pública por token na mesma origem onde antes houve uma sessão de admin
- **THEN** a requisição sai sem `Authorization` e sem qualquer identificador de inquilino, e o backend responde com base apenas no token

### Requirement: Guard de regressão contra vazamento de inquilino no cliente

A suíte de testes SHALL incluir um teste de contrato que intercepta as requisições de um conjunto representativo de mutações do admin e FALHA se qualquer payload incluir um campo de identificação de inquilino (`compradorId`, `comprador`, `tenantId` ou equivalente).

#### Scenario: Payload com identificador de inquilino quebra o build

- **WHEN** uma alteração futura faz uma chamada de escrita do admin incluir `compradorId` no corpo
- **THEN** o teste de contrato falha, bloqueando o merge antes de a regressão chegar à produção
