## MODIFIED Requirements

### Requirement: Cliente HTTP unificado
Todo consumo de APIs REST MUST ocorrer através de um utilitário centralizado (`api-client`) que intercepte e normalize erros. O utilitário SHALL:

- anexar as configurações base (URL base a partir de `VITE_API_BASE_URL`, `Content-Type`, e o header `Authorization: Bearer <token>` quando houver sessão);
- converter toda resposta de erro que traga corpo `application/problem+json` em um `ApiError` tipado com a mensagem pt-BR pronta para exibição;
- ao receber `401` **em uma requisição autenticada** (que carregava um token), limpar a sessão local (`sessionStorage`) e sinalizar à aplicação a necessidade de re-autenticar (redirecionamento para `/login`), em vez de propagar um `ApiError` genérico. O sinal SHALL ser entregue por um handler injetável, sem o `api-client` importar o roteador nem o contexto de autenticação;
- ao receber `401` **em uma requisição anônima** (sem token), tratar como `ApiError` normal (não autorizado), **sem** limpar sessão e **sem** redirecionar;
- tratar `404` sem corpo `application/problem+json` como "recurso ausente" (retorno vazio) SOMENTE quando a chamada declara explicitamente que é uma consulta de lookup; qualquer outro `404` SHALL virar `ApiError`.

#### Scenario: Consumo com sucesso
- **WHEN** o componente dispara uma chamada `api.get`
- **THEN** o utilitário anexa configurações base e processa o retorno corretamente

#### Scenario: Sessão expirada em qualquer chamada autenticada
- **WHEN** uma chamada a `/api/**` que carregava um token responde `401`
- **THEN** o `api-client` limpa o token de `sessionStorage` e a aplicação leva o usuário para `/login`, sem exibir uma tela de erro genérica

#### Scenario: Requisição anônima com 401 não redireciona
- **WHEN** uma chamada sem token (ex.: `GET /api/configuracoes` disparado em uma rota pública) responde `401`
- **THEN** o `api-client` lança `ApiError` (com a mensagem do `ProblemDetail` quando houver) e NÃO redireciona para `/login`

#### Scenario: Lookup de recurso inexistente
- **WHEN** uma consulta marcada como lookup (ex.: produto por GTIN) responde `404` sem `application/problem+json`
- **THEN** o `api-client` devolve um valor vazio e o chamador trata como "não encontrado", sem `ApiError`

#### Scenario: 404 fora de um lookup
- **WHEN** uma chamada comum (não-lookup) responde `404`
- **THEN** o `api-client` lança `ApiError` (com o `ProblemDetail` quando houver, ou uma mensagem genérica quando o corpo estiver vazio)
