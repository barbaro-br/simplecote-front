## Purpose

Fornece tipos TypeScript gerados automaticamente a partir do schema OpenAPI do back, como fonte alternativa e verificável aos tipos escritos à mão, reduzindo o risco de divergência silenciosa entre os dois repositórios.

## ADDED Requirements

### Requirement: Geração de tipos a partir do schema OpenAPI do back
O sistema SHALL prover um comando de desenvolvimento que busca o schema OpenAPI de uma URL de back configurável e produz um arquivo TypeScript com os tipos correspondentes aos schemas (DTOs, enums) expostos por ele.

#### Scenario: Geração bem-sucedida
- **WHEN** um desenvolvedor roda o comando de geração com o back acessível na URL configurada
- **THEN** um arquivo TypeScript é escrito (ou sobrescrito) no caminho definido para os tipos gerados, contendo um tipo ou interface para cada schema presente no OpenAPI do back

#### Scenario: Back inacessível
- **WHEN** um desenvolvedor roda o comando de geração e a URL configurada não responde ou não expõe um schema OpenAPI válido
- **THEN** o comando falha com uma mensagem de erro que identifica a URL usada e o motivo da falha, e nenhum arquivo de tipos existente é sobrescrito

### Requirement: Arquivo gerado é identificável e isolado
O arquivo de tipos gerado SHALL conter um cabeçalho indicando que é gerado automaticamente e não deve ser editado à mão, e SHALL residir em um caminho próprio, separado dos tipos escritos manualmente em `shared/domain` e nos `*.schema.ts` de cada feature.

#### Scenario: Desenvolvedor identifica um arquivo como gerado
- **WHEN** um desenvolvedor abre o arquivo de tipos gerado
- **THEN** as primeiras linhas do arquivo indicam claramente que ele é gerado automaticamente e não deve ser editado à mão

### Requirement: Geração é aditiva e não obrigatória
A existência do comando e do arquivo gerado SHALL NOT alterar o comportamento de nenhum tipo, hook ou chamada de API já existente no código do front. Nenhum passo de build, lint ou execução de testes existente SHALL depender da execução prévia do comando de geração.

#### Scenario: Build e testes seguem passando sem rodar a geração
- **WHEN** o comando de geração nunca foi executado num checkout novo do repositório
- **THEN** `npm run build`, `npm run test` e `npm run lint` completam normalmente, sem erro relacionado à ausência do arquivo gerado
