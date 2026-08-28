# SimpleCote Front — Especificação (fonte única do front-end)

> Documento único de especificação do front-end, irmão de `simplecote-back/spec.md` (fonte da verdade do domínio e da API). Contém **o quê** construir e **como** construir. Domínio em **português** (os mesmos termos do backend), scaffolding técnico em **inglês**, mensagens ao usuário em **português**. Gere testes junto com cada tela. Implemente por fases (seção 7). Onde este documento fala de regra de negócio, ele está **descrevendo** a regra que já vive no backend (`simplecote-back/spec.md`) — nunca reimplementando ou reinterpretando; onde fala de UI/estado local, aí sim é normativo por si.

---

## 1. Visão geral

O front-end do SimpleCote é o cliente HTTP do backend já pronto (`simplecote-back`, API REST documentada em `spec.md` §12, Swagger em `/swagger-ui.html`). Não há regra de negócio nova aqui — toda validação de domínio (apuração, máquinas de estado, snapshot, preço unitário) já existe e é aplicada pelo servidor; o front **exibe, coleta input e reage** ao que a API devolve, com uma responsabilidade adicional que é só dele: **não perder o que o representante já digitou** mesmo com conexão ruim (seção 10.2).

Duas áreas, dois públicos, duas prioridades de design:

- **Painel do admin/operador** (`/admin/**`) — desktop-first, denso em dado (tabelas, grade de preços), usado por quem já teria isso numa planilha. Prioridade: deixar comparar preço rápido e não deixar errar operação irreversível (apurar, cancelar).
- **Tela do representante** (`/cotacao/:token`, `/pedido/:token`) — mobile-first, aberta pelo link mágico, sem login. Prioridade: preencher preço com o polegar, em pé, com 3G ruim, sem medo de perder o que já digitou.

O front **não introduz autenticação antes do backend ter `autenticacao-jwt` implementado** (ainda não está — `simplecote-back` Fase "por último"). Enquanto isso, o painel do admin abre direto, sem tela de login, contra a API aberta (mesma lógica do backend: constrói tudo primeiro, pluga a sessão de verdade por último — seção 7). A tela do representante nunca teve login: sempre foi só o token na URL.

---

## 2. Linguagem ubíqua

Reaproveita **todos** os termos de `simplecote-back/spec.md` §2 (Comprador, Produto, Cotação, Participante, Lance, preço unitário etc.) sem redefinição — o front nunca inventa um sinônimo pro que o backend já nomeou. Termos que só existem no front:

| Termo | Definição |
|---|---|
| Rascunho local | Um lance digitado pelo representante que ainda não foi confirmado salvo pelo servidor. Vive só no `localStorage` do navegador dele. |
| Fila de sincronização | O conjunto de rascunhos locais pendentes de confirmação, por token de participante. |
| Autosave | O envio automático de um lance ao servidor pouco depois do representante parar de digitar (debounce), sem precisar de um botão "salvar". |
| Grade (grid) | A tabela do painel do admin com linhas = itens da cotação, colunas = representantes (mesma estrutura do "grid ao vivo" do backend, `spec.md` §10.5). |
| Sessão de dev | Enquanto não há JWT, o painel assume um único Comprador fixo (o mesmo `00000000-0000-0000-0000-000000000001` semeado pelo backend em dev) — não é um conceito novo, é só o front reconhecendo a mesma muleta que o backend usa (`spec.md` §7). |

---

## 3. Stack técnica

- **React 19 + Vite + TypeScript**, `strict: true` no `tsconfig` — sem `any` implícito, sem `// @ts-ignore` sem comentário justificando.
- **Roteamento**: `react-router-dom`. Duas árvores de rota independentes (§8) — não compartilham layout, guard ou estado.
- **Dados/cache**: **TanStack Query** para toda leitura e escrita contra a API (`spec.md` backend §3) — inclusive o **grid ao vivo** (polling, seção 10.5) e o **autosave** do representante (seção 10.2, como uma `mutation`, não uma chamada solta).
- **Formulários e validação**: `react-hook-form` + `zod`. O schema `zod` de cada formulário **espelha** as constraints de Bean Validation do DTO correspondente no backend (`spec.md` §16) — mesmo texto de mensagem em pt-BR sempre que possível, pra não ter uma mensagem no front e outra (diferente) vinda do `ProblemDetail` do servidor.
- **HTTP client**: um wrapper fino sobre `fetch` (sem axios — mesma filosofia do backend de não trazer dependência por conveniência). Traduz `ProblemDetail` (RFC 7807, backend regra 9) em um `ApiError` tipado com a mensagem pt-BR pronta pra exibir.
- **Estilo/componentes**: **Tailwind CSS v4** + **shadcn/ui**. Tokens de tema em `src/index.css` (seção 13) — nunca cor "mágica" solta num componente.
- **Gráficos**: **Recharts**, só na tela de análises (seção 8, `/admin/analises`).
- **Scanner de código de barras**: **`@zxing/browser`**, componente único reaproveitado em qualquer fluxo que precise bipar (cadastro de produto, adicionar item bipado a uma cotação).
- **Formatação de data/moeda**: `Intl.NumberFormat`/`Intl.DateTimeFormat` nativos, locale `pt-BR`, timezone `America/Sao_Paulo` — sem `date-fns`/`dayjs`; o volume de manipulação de data do front é baixo o suficiente pra não justificar a dependência.
- **Persistência local**: `localStorage` nativo (seção 10.2) — sem IndexedDB/Dexie; o volume por cotação (a fila de rascunhos de um representante) é pequeno (dezenas de itens, não milhares).
- **Testes**: **Vitest** + **React Testing Library** + **MSW** (`msw`) pra simular a API nos testes de componente — mesma disciplina do backend ("não gere código sem teste", regra 4 abaixo).
- **Lint/format**: o que o `create-vite` mais recente já traz (Oxlint) + Prettier pro formato. Não trocar por ESLint só por hábito — sem ganho concreto aqui.

---

## 4. Regras inegociáveis

1. **O front nunca decide regra de negócio.** Se uma tela parece precisar "calcular" algo que soa a domínio (quem ganhou, se pode editar, se o prazo venceu), o valor **já vem pronto da API** (ex.: `precoUnitario`, `podeEditar`, `menorPrecoUnitario` — todos campos derivados que o backend calcula e devolve, `spec.md` §12.3). O front formata pra exibição; não recalcula.
2. **`preco` é sempre número, nunca string**, tanto no que se envia quanto no que se recebe — mesmo `Dinheiro` do backend (regra 2 do backend), só sem o VO.
3. **Data/hora que vem da API é ISO-8601 com timezone (UTC)** — formatar pra `America/Sao_Paulo`/pt-BR só na exibição (mesma regra 3 do backend, espelhada).
4. **Toda tela nova tem teste** (Vitest + RTL): pelo menos o caminho feliz e o de erro de validação/API. Fluxo com mutação (criar, editar, autosave) tem teste do estado otimista e do rollback em erro.
5. **Nunca reimplementar o `ProblemDetail`** — todo erro de mutação exibido ao usuário vem do `ApiError.message` (seção 3), nunca de um texto genérico tipo "algo deu errado" quando a API já mandou o motivo em português.
6. **Idioma**: rótulo, mensagem, erro — tudo em **português**. Nome de componente, hook, arquivo — em **inglês**, seguindo o domínio em português só quando o nome é do domínio (`ProdutoForm`, não `ProductForm`; mas `useDebounce`, não `useDebounceEmPortugues`).
7. **Mobile-first é literal na tela do representante**: todo componente daquela árvore de rota é desenhado pra 375px de largura primeiro; desktop é o *enhancement*, não o padrão.
8. **Nenhuma tela do admin bloqueia numa operação irreversível sem confirmação explícita** — `apurar`, `cancelar`, `duplicar` (que já existe no backend) sempre passam por um diálogo de confirmação nomeando a consequência (ex.: "Apurar não pode ser desfeito. X itens sem nenhum lance ficarão sem vencedor.").
9. **A fila de sincronização (seção 10.2) nunca é opcional** — todo formulário de preço do representante passa por ela, mesmo em rede boa. É a mesma linha de código sempre; "rede boa" só significa que a fila esvazia rápido.

---

## 5. Arquitetura

Pasta por feature, espelhando o pacote-por-feature do backend (`spec.md` §5) — quem já sabe onde procurar `ProdutoService` no back acha `produtos/` no front sem pensar.

```
src/
├── admin/                    (área logada — hoje sem login de verdade, ver §1)
│   ├── layout/                AdminLayout, Sidebar, Topbar
│   ├── produtos/               lista, cadastro, bipagem
│   ├── empresas/                cadastro (nome só)
│   ├── representantes/          cadastro (sempre vinculado a uma Empresa)
│   ├── cotacoes/                lista, detalhe, grade ao vivo, resultado
│   ├── analises/
│   └── usuarios/
├── representante/             (área pública por token, sem AdminLayout)
│   ├── cotacao/                 CotacaoPorTokenPage (o formulário de preços)
│   └── pedido/                  PedidoPorTokenPage
├── shared/
│   ├── api/                     api-client.ts, tipos de erro
│   ├── components/               componentes shadcn/ui gerados + wrappers do projeto
│   ├── hooks/                    useDebounce, useFilaDeSincronizacao (§10.2)
│   └── format/                   moeda(), dataHoraBr(), etc.
└── routes.tsx                  árvore de rotas (admin + representante), ver §8
```

Cada feature (`produtos/`, `cotacoes/`, etc.) tem: `*.api.ts` (hooks TanStack Query — o único lugar que conhece o path da API), `*.schema.ts` (zod, espelhando o DTO do backend), componentes de página e de formulário. **Nenhum componente de UI chama `fetch` direto** — sempre via um hook de `*.api.ts`.

---

## 6. Setup do projeto

- `npm create vite@latest simplecote-front -- --template react-ts`, Node LTS.
- Alias `@/*` → `src/*` (`tsconfig.app.json` + `vite.config.ts`).
- `.env.development`: `VITE_API_BASE_URL=http://localhost:8080` (o backend sobe nessa porta via `./mvnw spring-boot:test-run`, `simplecote-back` memória de projeto). `.env.production` aponta pro domínio real quando existir deploy.
- `npx shadcn@latest init` (Tailwind v4, tema neutro como ponto de partida — cores reais na seção 13) + `npx shadcn@latest add <componente>` sob demanda, nunca a lib inteira de uma vez.
- Repositório git **próprio**, separado do `simplecote-back` (decisão já tomada em conversa: dois repositórios, não monorepo).

---

## 7. Ordem de implementação e fases

### Como trabalhar
Mesma disciplina do backend (`spec.md` §7): **uma fatia por vez** (tipos → hook de API → componente → teste), rodar `npm test` e só avançar com testes verdes. A **fatia de referência (seção 16, Produtos)** define a forma; copiá-la nas demais.

### Autenticação: front também espera o JWT por último
O painel do admin **nunca guarda token de sessão até `autenticacao-jwt` existir no backend**. Quando existir: entra uma tela de login, um `AuthProvider` guarda o JWT (memória + `sessionStorage`, nunca `localStorage` — token de sessão não é rascunho, não deve sobreviver a um dispositivo compartilhado), e toda chamada de `admin/` passa a levar o header `Authorization`. **Nenhuma tela de feature muda** — só o `api-client` ganha o header e as rotas `/admin/**` ganham um guard que redireciona pro login sem sessão.

### Fases (espelham as fases do backend, que já estão prontas)

**Fase 1 — o ciclo completo, painel + representante:**
1. Setup do projeto (seção 6) + shell de rotas (admin vazio + representante vazio) + `api-client` + `AnaliseComprasDTO`/tipos base.
2. Produtos, Empresas, Representantes — CRUD (fatia de referência, seção 16; Representante depende de uma Empresa já existir, backend `spec.md` §10.10).
3. Cotações: criar, montar itens, convidar **empresas** (não representantes individuais — backend `spec.md` §10.10), abrir.
4. **Tela do representante por token** (seção 10.2 completa: visualizar, digitar preço, autosave, fila de sincronização, finalizar) — é a tela de maior risco do MVP, entra cedo de propósito, não no fim.
5. Encerrar, apurar, ver resultado, pedidos (lista + PDF), enviar pedido.

**Fase 2 — acompanhamento:** grade ao vivo (polling, seção 10.1); nenhuma tela de lembrete é necessária (o lembrete é 100% backend/e-mail).

**Fase 3 — inteligência e povoamento:** tela de análises (Recharts); importação de catálogo (upload de arquivo); scanner GTIN (bipagem de produto, com ou sem cotação em rascunho aberta); botão duplicar cotação anterior; cancelar cotação.

**Por último:** tela de login + guard de rota + header JWT (ver acima).

---

## 8. Modelo de telas e rotas

### 8.1 Admin (`/admin/**`, hoje sem guard)

| Rota | Tela | Backend |
|---|---|---|
| `/admin` | Dashboard — lista de cotações por status, atalho "nova cotação" | `GET /api/cotacoes` |
| `/admin/produtos` | Catálogo: tabela + criar/editar/inativar + importar arquivo + bipar | `/api/produtos/**` |
| `/admin/empresas` | Tabela + criar/editar/inativar (só nome) | `/api/empresas/**` |
| `/admin/representantes` | Tabela + criar/editar/inativar — formulário de criação exige escolher a Empresa (select, uma por representante, backend `spec.md` §10.10) | `/api/representantes/**` |
| `/admin/cotacoes/nova` | Formulário de criação (+ duplicar de uma existente) | `POST /api/cotacoes`, `/duplicar` |
| `/admin/cotacoes/:id` | Detalhe: itens (RASCUNHO), participantes, ações de estado (abrir/encerrar/reabrir/cancelar/apurar) | `GET/POST /api/cotacoes/:id/**` |
| `/admin/cotacoes/:id/ao-vivo` | Grade ao vivo (polling) | `GET /api/cotacoes/:id/ao-vivo` |
| `/admin/cotacoes/:id/resultado` | Resultado da apuração + pedidos + exportar XLSX | `GET /api/cotacoes/:id/resultado`, `/resultado.xlsx`, `/pedidos` |
| `/admin/analises` | Filtro de período + gráficos | `GET /api/analises/compras` |
| `/admin/usuarios` | Tabela + criar/editar/inativar/trocar senha | `/api/usuarios/**` |

### 8.2 Representante (público, por token — **rotas fixas, ditadas pelo backend**)

O backend já embute essas rotas nos links que manda por e-mail/lembrete (`EnvioDeConvite`, `LembreteService`, `PedidoService` — todos montam `{baseUrl}/cotacao/{token}` ou `{baseUrl}/pedido/{token}`). O front **não escolhe** esse path — só implementa o que o backend já promete:

| Rota | Tela | Backend |
|---|---|---|
| `/cotacao/:token` | Formulário de preços (seção 10.2) | `GET/PUT /public/cotacoes/:token/**` |
| `/pedido/:token` | Visualizar pedido, baixar PDF, confirmar | `GET /public/pedidos/:token`, `/confirmar` |

Nenhuma dessas duas rotas usa `AdminLayout`; são páginas isoladas, mobile-first, sem navegação lateral nenhuma — o representante nunca "navega" o app, ele resolve uma tarefa e sai.

---

## 9. Estados e fluxos de UI

### 9.1 Estado de um campo de preço (tela do representante)

Cada célula de preço tem um estado de sincronização **independente do estado de domínio** (`PENDENTE`/`COTADO`/`NAO_COTADO`, que é do backend):

```
digitando -> (debounce 800ms) -> enviando -> sincronizado
                                      \-> falhou -> (na fila de sincronização, seção 10.2)
```

`sincronizado` e `falhou` têm indicador visual distinto (ex.: check verde discreto vs. ícone de "vai tentar de novo") — o representante **nunca** precisa entender fila/retry, só ver se está "salvo" ou não.

### 9.2 Espelho do estado do Participante

A tela do representante lê `participanteStatus` (`CONVIDADO`/`VISUALIZOU`/`RESPONDIDO`, backend `spec.md` §8.7) só pra decidir **se o formulário é editável** (`podeEditar` já vem pronto no DTO, regra 1 desta spec) — não reimplementa a máquina de estado, só reage a ela.

O cabeçalho da tela saúda a pessoa pelo próprio nome e dá o contexto de empresa/cliente (backend `spec.md` §10.10/§12.3): "Olá, {`representanteNome`}. Cotação da {`empresaNome`} referente ao {`compradorNome`}." — os três campos já vêm prontos em `CotacaoParticipanteDTO`, o front só monta a frase.

### 9.3 Grade ao vivo

Não tem estado próprio além do polling (seção 10.1) — cada resposta de `GET /ao-vivo` substitui a anterior por inteiro (sem merge incremental; o volume é pequeno o suficiente, `spec.md` backend §10.5).

---

## 10. Regras de negócio do front

### 10.1 Grade ao vivo — intervalo de polling

`useQuery` com `refetchInterval: 5000` (5s) enquanto a cotação está `ABERTA`; **para de dar poll** (`refetchInterval: false`) assim que `status` deixa de ser `ABERTA` — não adianta ficar consultando uma grade que não muda mais. Pausa também quando a aba perde foco (`refetchIntervalInBackground: false`, padrão do TanStack Query) — não gasta bateria/dado do celular do admin à toa.

### 10.2 Autosave e fila de sincronização (tela do representante)

Esta é a regra mais importante do front — decidida em conversa antes deste documento, formalizando aqui pra não se perder:

**Fonte de verdade é sempre o servidor.** Ao abrir `/cotacao/:token`, o front faz `GET /public/cotacoes/:token` e usa **exatamente** o que voltar — nunca preenche um campo com um valor só local sem tentar sincronizar primeiro.

**Fluxo de escrita, por item, independente dos outros:**
1. Representante digita um preço (ou marca "não cotado"). O campo entra em `digitando`.
2. Debounce de 800ms sem nova tecla → grava imediatamente uma entrada na fila local (`localStorage`, chave `simplecote:fila:{token}`, valor um mapa `itemCotacaoId -> { preco?, naoCotado?, tentativas, ultimaTentativaEm }`) e dispara a mutação `PUT /public/cotacoes/:token/lances` **só com aquele item** (a API aceita lista, mas o front manda um item por vez pra o feedback visual ser por célula, não por tela inteira).
3. Sucesso → remove **aquela entrada específica** da fila local, campo vira `sincronizado`.
4. Falha (rede) → campo vira `falhou`, entrada **permanece** na fila local, `tentativas += 1`.
5. Um `setInterval` de 10s (só enquanto a fila não está vazia) tenta reenviar cada entrada pendente da fila, na ordem em que entraram.
6. Ao voltar o evento `online` do navegador, força uma tentativa imediata (não espera o próximo tick do interval).

**Por que por item e não em lote**: se a conexão cair no meio, só o que realmente não chegou fica pendente — o que já sincronizou não é reenviado, e o representante não perde o que digitou antes da queda (era exatamente o cenário que motivou essa regra).

**Finalizar exige fila vazia.** O botão "Finalizar resposta" (`POST /public/cotacoes/:token/finalizar`) fica desabilitado com uma mensagem ("Sincronizando N preço(s)...") enquanto a fila local daquele token não estiver vazia — nunca se finaliza com rascunho pendente de verdade, porque depois de finalizar o backend trava edição (backend `spec.md` §8.7) e aquele preço nunca mais chegaria.

**Limpeza**: a fila daquele `token` só é apagada do `localStorage` inteira quando `finalizar` retorna sucesso (204) — até lá, mesmo com tudo sincronizado, o registro "zerado" continua existindo (vazio) pra sobreviver a um fechar-de-navegador no meio do caminho.

**Reconciliação ao reabrir a aba**: no mount da página, se existir uma fila não-vazia pra aquele token no `localStorage`, o front dispara o passo 5 imediatamente (não espera os 10s) — cobre o caso de ter fechado o navegador com pendência e reaberto depois.

### 10.3 Formatação

- Preço: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Data/hora: `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })`.
- Toda coluna numérica de tabela usa `font-variant-numeric: tabular-nums` (alinhamento visual, sem lib extra).

### 10.4 Erros de mutação

Toda mutação (`useMutation`) que falhar exibe `error.message` (já é o texto pt-BR do `ProblemDetail`, seção 3) num toast/inline — nunca um `console.error` silencioso nem um alerta genérico.

---

## 11. Casos de uso (por tela, mapeados aos casos de uso do backend `spec.md` §11)

**`/admin/produtos`**: CriarProduto, AtualizarProduto, InativarProduto, ImportarCatalogoDeArquivo, BuscarProdutoPorGtin + CadastrarProdutoBipado (scanner).
**`/admin/empresas`**: CriarEmpresa, AtualizarEmpresa, InativarEmpresa.
**`/admin/representantes`**: CriarRepresentante (formulário exige escolher a Empresa — `spec.md` §10.10), AtualizarRepresentante, InativarRepresentante.
**`/admin/cotacoes/nova`**: CriarCotacao, DuplicarCotacaoAnterior.
**`/admin/cotacoes/:id`**: AdicionarItemCotacao, RemoverItemCotacao, ConvidarEmpresa (seletor de Empresa, não de Representante — `spec.md` §10.10), ReenviarConvite, AbrirCotacao, EncerrarCotacao, ReabrirCotacao, CancelarCotacao, EditarLanceDeParticipante, ReabrirRespostaDeParticipante.
**`/admin/cotacoes/:id/ao-vivo`**: AcompanharAoVivo.
**`/admin/cotacoes/:id/resultado`**: ApurarEGerarPedidos, VisualizarResultado, EnviarPedido, ExportarResultadoXLSX.
**`/admin/analises`**: ConsultarAnaliseDeCompras.
**`/admin/usuarios`**: cadastro/atualização/inativação/troca de senha de Usuario (`usuario-cadastro`, backend já pronto).
**`/cotacao/:token`**: VisualizarCotacaoPorToken, RegistrarLances (com autosave, seção 10.2), FinalizarResposta.
**`/pedido/:token`**: VisualizarPedidoPorToken, ConfirmarPedido.

---

## 12. Contrato com a API

O contrato completo (métodos, paths, corpo, exemplos de JSON) é o de `simplecote-back/spec.md` §12 — **este documento não duplica**, só referencia. Dois pontos que o front precisa saber além do que está lá:

- **Erros**: toda resposta de erro é `ProblemDetail` (`application/problem+json`), `detail` é a mensagem pt-BR pronta pra exibir (backend regra 9). `404` sem corpo (`/produtos/lookup` não encontrado) é o único caso de "erro" sem `ProblemDetail` — tratado como um `Optional` vazio, não como `ApiError`.
- **Empresa, não Representante, nas telas de leitura**: grid ao vivo, resultado, pedido e análises trazem o campo `empresa`/`empresaNome` (não `representante`), backend `spec.md` §10.10 — é o nome que aparece na coluna/legenda em todo lugar, mesmo a pessoa por trás sendo um Representante. A tela do representante por token é a única exceção: ali sim ele é saudado pelo próprio nome (`representanteNome` em `CotacaoParticipanteDTO`, junto de `empresaNome`/`compradorNome` pra dar contexto — backend `spec.md` §12.3).
- **Enums**: `status` de Cotação/Participante/Lance/Pedido chegam como string (`"ABERTA"`, `"COTADO"` etc.) — o front define os mesmos union types em TypeScript, nunca um `string` solto pra esses campos.

---

## 13. Design system

Ponto de partida deliberado, não o tema neutro padrão do `shadcn init` — a paleta abaixo já nasce pronta em `src/index.css`, sob os mesmos tokens que o `shadcn/ui` espera (`--primary`, `--background` etc., seção 6), então trocar continua sendo só editar variáveis.

**Cor** — grounded no domínio (mercado de vizinhança fazendo compra por atacado; a interface do admin é a planilha que ele largou, seção 1):
- `--primary`: verde profundo `oklch(0.42 0.09 155)` — associação direta com mercado/hortifruti sem cair no clichê de card com barra lateral colorida; usado em ações primárias e no destaque de "menor preço" da grade.
- `--background`/`--card`: neutro levemente quente (`oklch(0.98 0.004 90)` claro / `oklch(0.16 0.006 90)` escuro) — não é cinza puro, tem um viés sutil pro verde do primary.
- Semântico da grade (**não é o mesmo token que o accent**, seção "quando é UI" — estado, não marca): `--success` (verde mais claro que o primary, "cotado"), `--warning` (âmbar, "pendente"), `--muted-foreground` pra "não cotado" (não é erro, é uma resposta válida).

**Tipografia**: `Public Sans` (Google Fonts) pro texto de interface — alta legibilidade em tabela densa de preço, que é o miolo do produto; pilha de fallback `system-ui, sans-serif`. Números tabulares (seção 10.3) em toda coluna de preço/quantidade.

**Tema claro/escuro**: os dois definidos desde o início (token-based, seguindo o padrão de `:root` / `prefers-color-scheme` / `[data-theme]` — mesmo mecanismo de qualquer artifact deste workspace). O painel do admin default pro tema do sistema; a tela do representante **força tema claro sempre** — é uma tela de uso rápido, uma vez, muitas vezes ao sol no celular; contraste alto e prévisível importa mais que preferência pessoal ali.

---

## 14. Requisitos não-funcionais

- **Responsivo**: tela do representante testada a partir de 375px de largura; painel do admin testado a partir de 1024px (abaixo disso, aceitável rolar tabela horizontalmente, nunca cortar dado).
- **Offline parcial**: a fila de sincronização (seção 10.2) é o único mecanismo de resiliência a rede ruim — não há Service Worker/PWA nesta fase (fora de escopo, seção 15).
- **Acessibilidade**: todo campo de formulário tem `label` associado; foco de teclado visível; contraste mínimo AA nas cores da seção 13.
- **Performance**: grade ao vivo não deve re-renderizar linhas que não mudaram entre polls (chave estável por `itemCotacaoId`, não índice de array).
- **Navegadores**: últimas duas versões de Chrome/Safari (mobile e desktop) — é o que um celular de representante e um desktop de admin de mercado de bairro realisticamente rodam.

---

## 15. Fora de escopo (agora)

- Service Worker / PWA / funcionar 100% offline (só a fila de sincronização parcial, seção 10.2).
- SSE no front (o backend já registra isso como evolução futura, `spec.md` §10.5 — o front troca só a camada de busca quando/se isso acontecer, nada a preparar agora).
- Internacionalização (i18n) — só pt-BR, sempre.
- Tema customizável pelo cliente (cor da marca do próprio Comprador) — fora do MVP.
- Notificação push no navegador.
- Testes end-to-end (Playwright/Cypress) — fica pra quando houver CI; por agora, Vitest + RTL no nível de componente/hook é a barra mínima (regra 4).

---

## 16. Fatia de referência: `produtos` (copiar a forma)

Implemente exatamente neste formato e replique nas demais features do admin. Pasta base: `src/admin/produtos/`.

### Tipos + schema — `produtos/produtos.schema.ts`

```typescript
import { z } from 'zod'

// Espelha CriarProdutoRequest do backend (spec.md §16) — mesmas constraints,
// mesmas mensagens em pt-BR sempre que possível.
export const tiposDeEmbalagem = ['Fardo', 'Caixa', 'Cartela', 'Unidade'] as const
export type TipoDeEmbalagem = (typeof tiposDeEmbalagem)[number]

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  codigoBarras: z.string().optional(),
  unidade: z.enum(tiposDeEmbalagem, { message: 'Informe o tipo de embalagem' }),
  quantidadePorEmbalagem: z.coerce
    .number()
    .int()
    .min(1, 'A quantidade por embalagem deve ser no mínimo 1'),
})

export type ProdutoFormValues = z.infer<typeof produtoSchema>

export type Produto = {
  id: string
  nome: string
  codigoBarras: string | null
  unidade: TipoDeEmbalagem
  quantidadePorEmbalagem: number
  ativo: boolean
}
```

### Hooks de API — `produtos/produtos.api.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { Produto, ProdutoFormValues } from './produtos.schema'

const chave = ['produtos'] as const

export function useProdutos() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<Produto[]>('/api/produtos'),
  })
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ProdutoFormValues) => api.post<Produto>('/api/produtos', valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useInativarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/produtos/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
```

### Formulário — `produtos/ProdutoForm.tsx`

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { produtoSchema, tiposDeEmbalagem, type ProdutoFormValues } from './produtos.schema'
import { useCriarProduto } from './produtos.api'

export function ProdutoForm({ aoSalvar }: { aoSalvar: () => void }) {
  const criar = useCriarProduto()
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: { nome: '', codigoBarras: '', unidade: 'Unidade', quantidadePorEmbalagem: 1 },
  })

  async function aoEnviar(valores: ProdutoFormValues) {
    await criar.mutateAsync(valores)
    form.reset()
    aoSalvar()
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-4">
      <Input {...form.register('nome')} placeholder="Nome do produto" />
      {form.formState.errors.nome && (
        <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
      )}

      <Input {...form.register('codigoBarras')} placeholder="Código de barras (opcional)" />

      <select {...form.register('unidade')} className="border-input h-9 w-full rounded-md border px-3">
        {tiposDeEmbalagem.map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>

      <Input
        type="number"
        min={1}
        {...form.register('quantidadePorEmbalagem')}
        placeholder="Quantidade por embalagem"
      />

      {criar.isError && <p className="text-sm text-destructive">{criar.error.message}</p>}

      <Button type="submit" disabled={criar.isPending}>
        {criar.isPending ? 'Salvando…' : 'Salvar produto'}
      </Button>
    </form>
  )
}
```

### Página — `produtos/ProdutosPage.tsx`

```tsx
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { moeda } from '@/shared/format/moeda'
import { useProdutos, useInativarProduto } from './produtos.api'
import { ProdutoForm } from './ProdutoForm'

export function ProdutosPage() {
  const { data: produtos, isLoading } = useProdutos()
  const inativar = useInativarProduto()
  const [mostrarForm, setMostrarForm] = useState(false)

  if (isLoading) return <p>Carregando catálogo…</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo de produtos</h1>
        <Button onClick={() => setMostrarForm((v) => !v)}>Novo produto</Button>
      </div>

      {mostrarForm && <ProdutoForm aoSalvar={() => setMostrarForm(false)} />}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th>Nome</th><th>Código de barras</th><th>Embalagem</th><th>Qtd./embalagem</th><th />
          </tr>
        </thead>
        <tbody>
          {produtos?.map((produto) => (
            <tr key={produto.id} className="border-t">
              <td>{produto.nome}</td>
              <td>{produto.codigoBarras ?? '—'}</td>
              <td>{produto.unidade}</td>
              <td className="tabular-nums">{produto.quantidadePorEmbalagem}</td>
              <td>
                <Button variant="ghost" size="sm" onClick={() => inativar.mutate(produto.id)}>
                  Inativar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Teste — `produtos/produtos.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ProdutosPage } from './ProdutosPage'

const server = setupServer(
  http.get('*/api/produtos', () =>
    HttpResponse.json([{ id: '1', nome: 'Arroz 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true }]),
  ),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

test('lista os produtos do catálogo', async () => {
  renderComQuery(<ProdutosPage />)
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
})

test('abre o formulário de novo produto', async () => {
  renderComQuery(<ProdutosPage />)
  await userEvent.click(screen.getByText('Novo produto'))
  expect(screen.getByPlaceholderText('Nome do produto')).toBeInTheDocument()
})
```

> **Copie exatamente esta forma** nas demais features: schema `zod` espelhando o DTO do backend, hooks `*.api.ts` como único ponto de contato com a rede, formulário `react-hook-form`, página que só orquestra hook + componentes, teste com MSW simulando a API. `api.get`/`api.post` (seção 3) resolve a URL relativa a `VITE_API_BASE_URL` — nenhuma feature conhece a URL completa do backend.
