## 1. Dependência e script

- [x] 1.1 Adicionar `openapi-typescript` como devDependency e verificar que `npm install` conclui sem erro
- [x] 1.2 Criar o script de geração (ex.: `scripts/gerar-tipos-api.ts` ou equivalente) que lê `API_TYPES_SOURCE_URL` (default `http://localhost:8080`), busca `{URL}/v3/api-docs` e grava o resultado em `src/shared/api/generated/openapi-types.ts`, com cabeçalho indicando arquivo gerado, comando de regeneração e URL de origem
- [x] 1.3 Adicionar `"gen:api-types"` em `scripts` do `package.json` apontando para o script criado
- [x] 1.4 Verificar cenário de back inacessível: rodar o comando sem o back de pé e confirmar que falha com mensagem clara identificando a URL usada, sem sobrescrever nenhum arquivo existente (spec `core/tipos-api-gerados` - Requirement "Back inacessível")

## 2. Geração inicial e isolamento

- [x] 2.1 Subir o back localmente e rodar `npm run gen:api-types`; verificar que `src/shared/api/generated/openapi-types.ts` é criado com um tipo/interface por schema exposto no OpenAPI do back
- [ ] 2.2 Commitar o arquivo gerado no repositório
- [x] 2.3 Verificar que nenhum arquivo fora de `src/shared/api/generated/` foi alterado pela geração (isolamento da spec "Arquivo gerado é identificável e isolado")

## 3. Não regressão

- [x] 3.1 Rodar `npm run build`, `npm run test` e `npm run lint` num checkout limpo (sem rodar a geração antes) e verificar que todos completam normalmente, confirmando a spec "Geração é aditiva e não obrigatória"
- [x] 3.2 Adicionar uma nota breve no `README.md` (ou doc equivalente do projeto) descrevendo o comando `npm run gen:api-types`, a variável `API_TYPES_SOURCE_URL` e que o uso é opcional
