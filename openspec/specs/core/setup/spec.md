# core/setup Specification

## Purpose
Fornece o esqueleto inicial de navegação e integração de rede da aplicação (roteamento duplo e cliente HTTP).

## Requirements

### Requirement: Roteamento isolado por perfil
A aplicação MUST disponibilizar duas árvores de rota independentes: uma área de administração (`/admin/**`) com navegação global, e uma área pública de acesso via token (`/cotacao/:token` e `/pedido/:token`) desenhada primariamente para mobile.

#### Scenario: Acesso Admin
- **WHEN** o usuário acessa `/admin/produtos`
- **THEN** a interface exibe o shell do painel (sidebar, layout global) e o conteúdo da rota

#### Scenario: Acesso Representante
- **WHEN** o usuário acessa `/cotacao/abc-123`
- **THEN** a interface exibe apenas o formulário da cotação sem navegação lateral (shell minimalista)

### Requirement: Cliente HTTP unificado
Todo consumo de APIs REST MUST ocorrer através de um utilitário centralizado (`api-client`) que intercepte e normalize erros. O utilitário SHALL:

- anexar as configurações base (URL base a partir de `VITE_API_BASE_URL`, `Content-Type`, e o header `Authorization: Bearer <token>` quando houver sessão);
- converter toda resposta de erro que traga corpo `application/problem+json` em um `ApiError` tipado com a mensagem pt-BR pronta para exibição;
- ao receber `401`, limpar a sessão local (`sessionStorage`) e sinalizar à aplicação a necessidade de re-autenticar (redirecionamento para `/login`), em vez de propagar um `ApiError` genérico. O sinal SHALL ser entregue por um handler injetável, sem o `api-client` importar o roteador nem o contexto de autenticação;
- tratar `404` sem corpo `application/problem+json` como "recurso ausente" (retorno vazio) SOMENTE quando a chamada declara explicitamente que é uma consulta de lookup; qualquer outro `404` SHALL virar `ApiError`.

#### Scenario: Consumo com sucesso
- **WHEN** o componente dispara uma chamada `api.get`
- **THEN** o utilitário anexa configurações base e processa o retorno corretamente

#### Scenario: Sessão expirada em qualquer chamada autenticada
- **WHEN** uma chamada a `/api/**` responde `401`
- **THEN** o `api-client` limpa o token de `sessionStorage` e a aplicação leva o usuário para `/login`, sem exibir uma tela de erro genérica

#### Scenario: Lookup de recurso inexistente
- **WHEN** uma consulta marcada como lookup (ex.: produto por GTIN) responde `404` sem `application/problem+json`
- **THEN** o `api-client` devolve um valor vazio e o chamador trata como "não encontrado", sem `ApiError`

#### Scenario: 404 fora de um lookup
- **WHEN** uma chamada comum (não-lookup) responde `404`
- **THEN** o `api-client` lança `ApiError` (com o `ProblemDetail` quando houver, ou uma mensagem genérica quando o corpo estiver vazio)

### Requirement: Reset de scroll na navegação
A aplicação SHALL resetar a posição de scroll para o topo ao navegar entre rotas do painel (`/admin/**`), sem que o conteúdo da nova tela apareça deslocado para baixo ou "salte". Ao usar o back/forward (POP) do navegador, a posição de scroll anterior SHALL ser restaurada.

#### Scenario: Navegação entre telas do painel
- **WHEN** o usuário navega de uma tela do painel para outra (ex.: `/usuarios` → `/cotacoes`)
- **THEN** a nova tela abre com o scroll no topo, sem deslocamento ou salto visível

#### Scenario: Voltar restaura a posição
- **WHEN** o usuário usa o botão voltar (back) do navegador
- **THEN** a tela anterior reaparece na posição de scroll em que estava
