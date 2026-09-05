---
name: qa-varredura
description: Varredura manual completa do app rodando (login, todas as páginas admin, fluxos de CRUD, responsividade, console/rede) com relatório de achados no final. Use quando o usuário pedir para "testar tudo", validar visualmente mudanças pendentes, ou fazer um QA geral antes de commitar/deployar.
metadata:
  author: simplecote
  version: "1.0"
---

Varredura manual do sistema rodando em `localhost:5173` (front) + `localhost:8080` (back), via
agente de navegador (Browser Agent nativo do Antigravity — não usar Puppeteer/outra automação
separada, o navegador embutido já cobre clique, digitação, screenshot e leitura de console/rede).

**Isto é QA/observação, não implementação.** Não edite código-fonte durante a varredura. Se
encontrar um bug, registre no relatório final — não corrija no meio do teste, a menos que o
usuário peça explicitamente.

## Antes de começar

1. Confirme que o backend está no ar: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/`
   (deve responder). Se não estiver, suba com
   `AUTH_ENABLED=true ./mvnw spring-boot:test-run` no repo irmão `simplecote-back` (requer Docker).
2. Confirme que o front está no ar em `:5173` (`npm run dev`); se não, suba.
3. Login de dev (seed): `admin@dev.local` / `admin123` em `http://localhost:5173/login`.

## Mapa de rotas (fonte: `src/routes.tsx` — releia antes de rodar, pode ter mudado)

- Públicas: `/login`, `/esqueci-senha`, `/redefinir-senha/:token`
- Admin (autenticado): `/admin` (Dashboard), `/admin/cotacoes`, `/admin/cotacoes/nova`,
  `/admin/cotacoes/:id`, `/admin/cotacoes/:id/resultado`, `/admin/produtos`, `/admin/empresas`,
  `/admin/usuarios`, `/admin/analises`, `/admin/configuracoes`
- Representante/colaborador (via token, layout `TemaClaro`): `/cotacao/:token`, `/pedido/:token`,
  `/colaborador/:token` — para testar, gere um token real a partir da própria UI admin (link do
  colaborador em Configurações, ou convite de representante dentro de uma cotação).

## Guardrails (não pule isso)

- **Nunca** apague ou edite dados de seed importantes para outros testes/telas: cotações
  "semana 33/34/35 (...)", "Stress 200 itens (grade)", o usuário `admin@dev.local`. Se for testar
  exclusão/inativação, crie um registro descartável primeiro (produto, empresa, usuário, cotação)
  e apague esse.
- Não dispare `alert`/`confirm`/`prompt` nativos do navegador sem necessidade — travam a sessão do
  agente. Prefira `console.log` + leitura de console para depurar.
- Se uma ação não responder após 2-3 tentativas, anote como achado e siga — não insista em loop.

## O que testar em cada área (adapte à UI real; isto é um guia, não um roteiro rígido)

1. **Login**: credenciais erradas, campo vazio, sucesso, logout, acesso a `/admin/*` sem sessão
   (deve redirecionar), esqueci senha, redefinir senha com token inválido.
2. **Dashboard**: carrega sem erro, métricas/gráficos renderizam.
3. **Cotações**: filtros (status, mês, busca), criar nova (validação), abrir uma existente — grade
   ao vivo (editar quantidade, adicionar item via modal, buscar produto), encerrar, apurar, gerar
   pedido, resultado (export), cancelar, excluir (com dado descartável), convidar/desconvidar
   representante.
4. **Produtos / Empresas / Usuários**: listar, criar (validação), editar, buscar, inativar/excluir
   (com dado descartável).
5. **Análises**: gráficos carregam, filtros de período sem erro de console/rede.
6. **Configurações**: trocar de aba, salvar (confirma toast e persistência real — histórico:
   já existiu período em que essa tela era só mock em memória e não persistia nada, vale
   sempre reconfirmar), copiar link do colaborador e validar que o link copiado realmente abre.
7. **Em toda página**: cheque console de erros/warnings e requisições de rede 4xx/5xx. Teste
   responsividade em pelo menos uma tela (~375px de largura) — a sidebar do `AdminLayout` é
   compartilhada, então um problema ali afeta tudo.
8. **Representante/colaborador via token**: se conseguir um token válido, teste o fluxo principal
   (responder preço, autosave, finalizar / adicionar item via colaborador).

## Relatório final

Estruture por área (Login, Dashboard, Cotações, Produtos, Empresas, Usuários, Análises,
Configurações, Representante/Colaborador, Geral/Responsividade). Para cada achado: severidade
(bug real vs. observação menor), descrição objetiva, passos para reproduzir, erro de
console/rede associado (se houver). Área sem problema: uma linha dizendo que está OK, sem
elaborar. Antes de apontar algo como "bug do backend", confirme com uma chamada direta
(`curl` autenticado, ou inspecionar a resposta de rede) — não deduza só pela UI.
