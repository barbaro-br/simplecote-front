## ADDED Requirements

### Requirement: Timeout assíncrono tolerante à contenção de CPU da suíte completa

O sistema SHALL configurar o timeout de espera assíncrona (`asyncUtilTimeout`) do `@testing-library/dom` globalmente em `setupTests.ts`, com um valor maior que o padrão da biblioteca (1000ms) — suficiente pra tolerar a variação de tempo de resposta do MSW quando a suíte completa roda sob carga (muitos arquivos de teste em paralelo, `pool: 'forks'`), sem depender de ajuste teste por teste.

#### Scenario: Teste com fetch simulado não falha por contenção de CPU na suíte completa

- **WHEN** a suíte completa (`npm test`) roda com todos os arquivos em paralelo, e um teste específico depende de `findBy*`/`waitFor` aguardando uma resposta do MSW
- **THEN** o teste tem até o timeout configurado (maior que o padrão de 1000ms) pra completar, em vez de falhar por contenção de CPU quando o comportamento em si está correto

#### Scenario: Teste isolado continua rápido

- **WHEN** um teste roda isolado (fora da suíte completa, sem contenção de CPU)
- **THEN** ele continua completando bem antes do timeout configurado, sem atraso perceptível no feedback de falhas reais
