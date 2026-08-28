## 1. Fundação da feature

- [x] 1.1 Criar `src/admin/cotacoes/cotacoes.schema.ts`: tipos derivados do contrato real (`GET /v3/api-docs` conferido) — `CotacaoResumo`, `CotacaoDetalhe`, `ItemCotacao`, `ItemOmitido`, `CotacaoDuplicada`, `Pedido`, `ItemPedido`, `Resultado` — e schemas zod de `CriarCotacao` (`titulo`), `AbrirCotacao` (`prazo`), `AdicionarItem` (`produtoId`, `quantidade`). Reusar os union de status de `@/shared/domain/tipos-base`. Verificar: `npx tsc -b` verde.
- [x] 1.2 Criar `src/admin/cotacoes/cotacoes.api.ts` com os hooks TanStack Query dos endpoints do `design.md` desta change (`useCotacoes`, `useCotacao`, `useCriarCotacao`, `useDuplicarCotacao`, `useAdicionarItem`, `useRemoverItem`, `useAbrir`, `useEncerrar`, `useReabrir`, `useCancelar`, `useApurar`, `useResultado`, `usePedidos`, `useEnviarPedido`) — leitura via `useQuery`, mutações via `useMutation` com `invalidateQueries` no `onSuccess`. Verificar: compila; nenhum componente fora deste arquivo referencia um path `/api/...` de cotação.
- [x] 1.3 Adicionar ao `api-client` (ou helper em `cotacoes.api.ts`) uma função de download binário autenticado (`fetch` + `Authorization` + `blob()` + `URL.createObjectURL` + `<a download>`). Verificar: teste unitário com MSW devolvendo um `Blob` → a função resolve sem erro.

## 2. Lista e criação

- [x] 2.1 `CotacoesPage.tsx` (rota index de `/admin`): tabela de cotações de `useCotacoes()` com título/status/prazo, filtro por status e botão "Nova cotação". Atualizar `src/routes.tsx` (index) e o link "Cotações" do `AdminLayout`. Verificar: teste MSW lista as cotações e o filtro por status reduz as linhas.
- [x] 2.2 `NovaCotacaoPage.tsx` (`/admin/cotacoes/nova`): form de `titulo` (`react-hook-form` + zod) e seletor "duplicar de uma existente". Ao criar/duplicar, navega para `/admin/cotacoes/:id`. Verificar: teste MSW — criar com título válido navega para o detalhe; título vazio bloqueia sem request.

## 3. Detalhe da cotação

- [x] 3.1 `CotacaoDetalhePage.tsx` (`/admin/cotacoes/:id`) carregando `useCotacao(id)`: cabeçalho com status e as ações de estado disponíveis para aquele status. Verificar: teste MSW renderiza o detalhe e mostra só as ações válidas para o status mockado.
- [x] 3.2 `ItensSection`: adicionar item (seletor de Produto + quantidade → `useAdicionarItem`) e remover (`useRemoverItem`), **visível/editável só em `RASCUNHO`**. Verificar: teste MSW — em `RASCUNHO` adiciona e remove; em `ABERTA` os controles não aparecem.
- [x] 3.4 `ConfirmarDialog` genérico + `AbrirCotacaoDialog` (coleta `prazo` via `datetime-local` → ISO com offset). Fiar as ações: `useAbrir` (com prazo), `useEncerrar`, `useReabrir`, `useCancelar` (confirmar), `useApurar` (confirmar, texto da consequência conforme `spec.md` regra 8). Verificar: teste MSW — "Apurar" só chama a API após confirmação no diálogo; abrir envia o `prazo` em ISO.
- [~] 3.3 / 3.5 **Movidos** para a change `admin-cotacoes-participantes-respostas` (`ParticipantesSection`, `RespostasSection`, correção de lance, reabrir resposta). Bloqueados por falta de `GET /api/cotacoes/{id}/participantes`, identidade de Empresa em `ParticipanteResponse` e `participanteId` em `GridAoVivoDTO.Celula` — dependem de mudança no `simplecote-back`.

## 4. Resultado e pedidos

- [x] 4.1 `ResultadoPage.tsx` (`/admin/cotacoes/:id/resultado`): `useResultado(id)` — vencedor por item pelo **nome da Empresa**, preços já vindos prontos (sem recálculo). `usePedidos(id)` — lista de pedidos com "Enviar" (`useEnviarPedido`). Botões "Baixar XLSX" e "Baixar PDF" usando a função de download binário. Verificar: teste MSW — resultado renderiza vencedores por empresa; "Enviar" atualiza o status do pedido; o clique de download chama o endpoint binário.

## 5. Fechamento

- [x] 5.1 `npx vitest run` verde (novos testes por tela), `npx tsc -b` 0, `npm run build` completa.
- [x] 5.2 Verificado contra o backend vivo (`:8080`, auth ligada): `POST /api/cotacoes {titulo}` → `201` (shape = `CotacaoDetalhe`); `POST /{id}/itens {produtoId,quantidade}` → `201`; `GET /{id}` → `itens[]` com os campos `*Snapshot` exatos; `GET /{id}/resultado` → `{pedidos:[], itensSemVencedor:[ItemCotacao]}` (= `Resultado`); `POST /{id}/cancelar` → `200`. **Sem divergência de contrato — nenhuma correção de código foi necessária.** O trecho `abrir → encerrar → apurar → resultado → enviar` para em `POST /{id}/abrir` → `422 ProblemDetail` "Convide ao menos um representante antes de abrir a cotação." — dependência da change `admin-cotacoes-participantes-respostas` (convite de Empresas), não um bug; o front exibe esse `ProblemDetail` no `role="alert"` (cenário "Transição inválida mostra o erro do backend").
- [x] 5.3 `openspec validate admin-cotacoes` sem erros.
