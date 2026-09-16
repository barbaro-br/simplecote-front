## Why

O front escreve à mão, por feature (`*.schema.ts`, `shared/domain`), os tipos TypeScript que espelham os DTOs e enums do back (Spring Boot + springdoc). Sem nenhum mecanismo automático de verificação, um campo renomeado, removido ou um enum alterado no back só é percebido em runtime (ou em um teste que cubra o caso) — não em tempo de build. O back já expõe o schema completo via springdoc (`/v3/api-docs`); hoje esse schema só é usado para o Swagger UI, nunca para gerar nada no front.

## What Changes

- Adiciona um script de desenvolvimento (`npm run gen:api-types`) que baixa o schema OpenAPI de uma URL do back configurável (`VITE_API_BASE_URL` em dev, ou uma URL informada por variável de ambiente) e gera um arquivo TypeScript de tipos a partir dele.
- O arquivo gerado é commitado no repositório, isolado num diretório próprio, com um cabeçalho indicando que é gerado e não deve ser editado à mão.
- Uso é opcional e aditivo nesta primeira etapa: nenhum tipo escrito à mão existente é removido ou substituído por este change. Migrar chamadas específicas para os tipos gerados fica para changes futuras, feature a feature.
- **Não** adiciona checagem de CI nem torna a geração obrigatória — fica de fora do escopo desta change (ver Impact).

## Capabilities

### New Capabilities
- `core/tipos-api-gerados`: script e saída de geração de tipos TypeScript a partir do schema OpenAPI do back, para uso opcional em código novo ou migrado.

### Modified Capabilities
(nenhuma — os requisitos existentes de `core/domain-types` sobre tipos escritos à mão continuam valendo; esta change não os substitui.)

## Impact

- **Novo**: script `scripts/gerar-tipos-api.*` (ou equivalente), dependência de dev (`openapi-typescript` ou similar), arquivo gerado em `src/shared/api/generated/` (ou caminho equivalente a definir em design.md).
- **Nenhum código existente é alterado** — nenhuma tela, hook ou `*.api.ts` atual muda de comportamento.
- **Fora de escopo**: checagem automática no CI (falharia sem o back acessível a partir do runner do front — decisão registrada na exploração que originou esta change); publicação de um `openapi.json` estático pelo back (mudança no repositório `simplecote-back`, fora do escopo deste front); migração dos tipos manuais existentes para os gerados.
- **Dependência externa**: requer o back rodando e acessível (local, ou uma URL de staging) no momento em que alguém rodar o script — não é uma dependência de build/runtime da aplicação.
