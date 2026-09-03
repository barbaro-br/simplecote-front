# core/test-infra Specification

## Purpose
Garante que toda regra de interface e comunicação HTTP seja validada simulando os exatos contratos de rede do backend, evitando dependência de servidor ativo.

## Requirements

### Requirement: Testes unitários independentes do backend
O sistema MUST utilizar uma ferramenta de interceptação de rede (MSW) em seus testes de componente para simular os retornos JSON documentados pela API, sem jamais realizar chamadas de rede reais durante a esteira de teste.

#### Scenario: Mock de requisição com sucesso
- **WHEN** um componente consulta dados da API via `api-client` em ambiente de teste
- **THEN** o MSW intercepta a requisição e devolve um JSON pré-configurado sem falhar por CORS ou servidor fora do ar

#### Scenario: Mock de requisição com falha ProblemDetail
- **WHEN** o teste precisa validar tratamento de erro
- **THEN** o MSW retorna um JSON no formato `application/problem+json` e o `api-client` converte corretamente para a view

### Requirement: Timeout assíncrono tolerante à contenção de CPU da suíte completa

O sistema SHALL configurar o timeout de espera assíncrona (`asyncUtilTimeout`) do `@testing-library/dom` globalmente em `setupTests.ts`, com um valor maior que o padrão da biblioteca (1000ms) — suficiente pra tolerar a variação de tempo de resposta do MSW quando a suíte completa roda sob carga (muitos arquivos de teste em paralelo, `pool: 'forks'`), sem depender de ajuste teste por teste.

#### Scenario: Teste com fetch simulado não falha por contenção de CPU na suíte completa
- **WHEN** a suíte completa (`npm test`) roda com todos os arquivos em paralelo, e um teste específico depende de `findBy*`/`waitFor` aguardando uma resposta do MSW
- **THEN** o teste tem até o timeout configurado (maior que o padrão de 1000ms) pra completar, em vez de falhar por contenção de CPU quando o comportamento em si está correto

#### Scenario: Teste isolado continua rápido
- **WHEN** um teste roda isolado (fora da suíte completa, sem contenção de CPU)
- **THEN** ele continua completando bem antes do timeout configurado, sem atraso perceptível no feedback de falhas reais
