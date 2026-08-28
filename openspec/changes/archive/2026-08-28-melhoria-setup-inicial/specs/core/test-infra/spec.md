## Purpose

Garante que toda regra de interface e comunicação HTTP seja validada simulando os exatos contratos de rede do backend, evitando dependência de servidor ativo.

## ADDED Requirements

### Requirement: Testes unitários independentes do backend
O sistema MUST utilizar uma ferramenta de interceptação de rede (MSW) em seus testes de componente para simular os retornos JSON documentados pela API, sem jamais realizar chamadas de rede reais durante a esteira de teste.

#### Scenario: Mock de requisição com sucesso
- **WHEN** um componente consulta dados da API via `api-client` em ambiente de teste
- **THEN** o MSW intercepta a requisição e devolve um JSON pré-configurado sem falhar por CORS ou servidor fora do ar

#### Scenario: Mock de requisição com falha ProblemDetail
- **WHEN** o teste precisa validar tratamento de erro
- **THEN** o MSW retorna um JSON no formato `application/problem+json` e o `api-client` converte corretamente para a view
