# core/setup Specification

## Purpose
Fornece o esqueleto inicial de navegação e integração de rede da aplicação (roteamento duplo e cliente HTTP).

## Requirements

### Requirement: Roteamento isolado por perfil
A aplicação MUST disponibilizar duas árvores de rota independentes: uma área de administração (`/admin/**`) com navegação global e guarda de sessão, e uma área pública desenhada primariamente para mobile. A área pública inclui as rotas anônimas de acesso via token (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) e as rotas anônimas de entrada de conta (`/login`, `/esqueci-senha`, `/cadastro`, `/verificar-email`) — nenhuma delas SHALL renderizar o shell do painel nem exigir sessão autenticada.

#### Scenario: Acesso Admin
- **WHEN** o usuário acessa `/admin/produtos`
- **THEN** a interface exibe o shell do painel (sidebar, layout global) e o conteúdo da rota

#### Scenario: Acesso Representante
- **WHEN** o usuário acessa `/cotacao/abc-123`
- **THEN** a interface exibe apenas o formulário da cotação sem navegação lateral (shell minimalista)

#### Scenario: Acesso ao cadastro público
- **WHEN** um visitante sem sessão acessa `/cadastro` ou `/verificar-email`
- **THEN** a interface exibe a tela pública correspondente, sem o shell do painel e sem redirecionar para `/login`

### Requirement: Cliente HTTP unificado
Todo consumo de APIs REST MUST ocorrer através de um utilitário centralizado (`api-client`) que intercepte e normalize erros. O utilitário SHALL:

- anexar as configurações base (URL base a partir de `VITE_API_BASE_URL`, `Content-Type`, e o header `Authorization: Bearer <token>` quando houver sessão), com o access token mantido **em memória** (não em `sessionStorage`);
- converter toda resposta de erro que traga corpo `application/problem+json` em um `ApiError` tipado com a mensagem pt-BR pronta para exibição;
- ao receber `401` **em uma requisição autenticada** (que carregava um token), tentar **uma única vez** renovar a sessão via `POST /api/auth/refresh` (que reapresenta o cookie `httpOnly` do refresh token); se a renovação der certo, **repetir a requisição original** de forma transparente com o novo access token; se a renovação falhar, limpar a sessão local e sinalizar à aplicação a necessidade de re-autenticar (redirecionamento para `/login`), em vez de propagar um `ApiError` genérico. O sinal SHALL ser entregue por um handler injetável, sem o `api-client` importar o roteador nem o contexto de autenticação;
- ao receber múltiplos `401` concorrentes, compartilhar **um único** `refresh` em voo — não disparar um por chamada;
- ao receber `401` **em uma requisição anônima** (sem token), tratar como `ApiError` normal (não autorizado), **sem** tentar refresh, **sem** limpar sessão e **sem** redirecionar;
- tratar `404` sem corpo `application/problem+json` como "recurso ausente" (retorno vazio) SOMENTE quando a chamada declara explicitamente que é uma consulta de lookup; qualquer outro `404` SHALL virar `ApiError`.

#### Scenario: Consumo com sucesso
- **WHEN** o componente dispara uma chamada `api.get`
- **THEN** o utilitário anexa configurações base e processa o retorno corretamente

#### Scenario: Access token expirado é renovado de forma transparente
- **WHEN** uma chamada a `/api/**` responde `401` e o `POST /api/auth/refresh` seguinte tem sucesso
- **THEN** o `api-client` repete a requisição original com o novo access token e o chamador recebe a resposta de sucesso, sem que o usuário perceba ou saia da tela

#### Scenario: 401 concorrentes disparam um único refresh
- **WHEN** várias chamadas autenticadas recebem `401` quase ao mesmo tempo
- **THEN** apenas um `POST /api/auth/refresh` é feito, e todas as chamadas são repetidas (ou todas falham) conforme o resultado desse único refresh

#### Scenario: Sessão expirada em qualquer chamada autenticada
- **WHEN** uma chamada a `/api/**` que carregava um token responde `401` e o `POST /api/auth/refresh` seguinte também falha
- **THEN** o `api-client` limpa o token em memória e a aplicação leva o usuário para `/login`, sem exibir uma tela de erro genérica

#### Scenario: Requisição anônima com 401 não redireciona
- **WHEN** uma chamada sem token (ex.: `GET /api/configuracoes` disparado em uma rota pública) responde `401`
- **THEN** o `api-client` lança `ApiError` (com a mensagem do `ProblemDetail` quando houver), NÃO tenta refresh e NÃO redireciona para `/login`

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

### Requirement: Sessão sobrevive a recarregar a página

No carregamento da aplicação, antes de renderizar as rotas, o `AuthContext` SHALL tentar uma vez `POST /api/auth/refresh`. Se o cookie `httpOnly` do refresh token ainda for válido, a sessão SHALL ser restaurada (access token em memória) sem passar pela tela de `/login`. Enquanto essa tentativa está em curso, a aplicação SHALL exibir o estado de carregamento de rota, e SHALL NOT redirecionar para `/login` antes de a tentativa concluir. Se o refresh falhar, o usuário SHALL começar deslogado. O `logout` SHALL chamar `POST /api/auth/logout` para invalidar o refresh token no servidor, além de descartar o estado local.

#### Scenario: Recarregar no meio de uma sessão válida

- **WHEN** o usuário está autenticado no painel e recarrega a página
- **THEN** o app faz o refresh no boot, restaura a sessão e reabre a rota atual, sem exigir novo login

#### Scenario: Boot sem refresh token válido

- **WHEN** o usuário abre o app sem um cookie de refresh válido (nunca logou, ou expirou)
- **THEN** após a tentativa de refresh no boot, o app apresenta o estado deslogado e o acesso a `/admin/**` leva ao `/login`

#### Scenario: Logout invalida a sessão no servidor

- **WHEN** o usuário aciona "sair"
- **THEN** o app chama `POST /api/auth/logout`, descarta o access token em memória, e um refresh posterior com o mesmo cookie é rejeitado
