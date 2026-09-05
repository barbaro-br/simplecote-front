## 1. api-client — 401 anônimo não redireciona

- [x] 1.1 Em `src/shared/api/api-client.ts`, exigir `token` na condição do ramo 401 de "sessão expirada" (`... && !publico && token`) — verificar que 401 sem token cai em `ApiError`
- [x] 1.2 Teste unitário: 401 numa chamada SEM token enviado → rejeita com `ApiError` e NÃO chama o handler de sessão expirada (cobertura em `api-client.test.ts`)

## 2. ConfiguracaoLojaProvider — não busca config em rota pública

- [x] 2.1 Adicionar parâmetro `enabled` (default `true`) ao `useConfiguracaoLoja` em `configuracoes.api.ts` e repassar ao `useQuery`
- [x] 2.2 Em `ConfiguracaoLojaProvider.tsx`, usar `useAuth().isAutenticado` e passar `enabled: isAutenticado` — verificar que sem sessão nenhuma chamada a `/api/configuracoes` é disparada
- [x] 2.3 Teste do provider: desautenticado, `/api/configuracoes` não é chamado; autenticado, a busca acontece e aplica `--primary`/tema

## 3. Checagem de saúde

- [x] 3.1 `npm test` verde (Vitest + RTL)
- [x] 3.2 `npm run build` e `npm run lint` sem erro novo
