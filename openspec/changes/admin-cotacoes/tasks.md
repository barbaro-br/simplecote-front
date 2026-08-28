## 1. Fundação da feature

- [ ] 1.1 Criar `src/admin/cotacoes/cotacoes.schema.ts`: tipos derivados das respostas reais do backend (conferir `/swagger-ui.html`) — `CotacaoResumo`, `CotacaoDetalhe`, `ItemCotacao`, `Participante`, `Resultado`, `Pedido` — e schemas zod de `CriarCotacao` (`titulo`), `AbrirCotacao` (`prazo`), `CorrigirLance` (`preco?`/`naoCotado`). Reusar os union de status de `@/shared/domain/tipos-base`. Verificar: `npx tsc -b` verde.
- [ ] 1.2 Criar `src/admin/cotacoes/cotacoes.api.ts` com os hooks TanStack Query para todos os endpoints listados no `design.md` (leitura via `useQuery`, mutações via `useMutation` com `invalidateQueries` no `onSuccess`). Verificar: compila; nenhum componente fora deste arquivo referencia um path `/api/...` de cotação.
- [ ] 1.3 Adicionar ao `api-client` (ou helper em `cotacoes.api.ts`) uma função de download binário autenticado (`fetch` + `Authorization` + `blob()` + `URL.createObjectURL` + `<a download>`). Verificar: teste unitário com MSW devolvendo um `Blob` → a função resolve sem erro.

## 2. Lista e criação

- [ ] 2.1 `CotacoesPage.tsx` (rota index de `/admin`): tabela de cotações de `useCotacoes()` com título/status/prazo, filtro por status e botão "Nova cotação". Atualizar `src/routes.tsx` (index) e o link "Cotações" do `AdminLayout`. Verificar: teste MSW lista as cotações e o filtro por status reduz as linhas.
- [ ] 2.2 `NovaCotacaoPage.tsx` (`/admin/cotacoes/nova`): form de `titulo` (`react-hook-form` + zod) e seletor "duplicar de uma existente". Ao criar/duplicar, navega para `/admin/cotacoes/:id`. Verificar: teste MSW — criar com título válido navega para o detalhe; título vazio bloqueia sem request.

## 3. Detalhe da cotação

- [ ] 3.1 `CotacaoDetalhePage.tsx` (`/admin/cotacoes/:id`) carregando `useCotacao(id)`: cabeçalho com status e as ações de estado disponíveis para aquele status. Verificar: teste MSW renderiza o detalhe e mostra só as ações válidas para o status mockado.
- [ ] 3.2 `ItensSection`: adicionar item (seletor de Produto → `useAdicionarItem`) e remover (`useRemoverItem`), **visível/editável só em `RASCUNHO`**. Verificar: teste MSW — em `RASCUNHO` adiciona e remove; em `ABERTA` os controles não aparecem.
- [ ] 3.3 `ParticipantesSection`: multi-seleção de Empresas ativas → `useConvidarEmpresas`; lista de participantes com status de convite; "Reenviar" (`useReenviarConvite`) e "Copiar link". Verificar: teste MSW — convidar 2 empresas adiciona 2 participantes; erro `ProblemDetail` da API é exibido.
- [ ] 3.4 `ConfirmarDialog` genérico + `AbrirCotacaoDialog` (coleta `prazo` via `datetime-local` → ISO com offset). Fiar as ações: `useAbrir` (com prazo), `useEncerrar`, `useReabrir`, `useCancelar` (confirmar), `useApurar` (confirmar, texto da consequência conforme `spec.md` regra 8). Verificar: teste MSW — "Apurar" só chama a API após confirmação no diálogo; abrir envia o `prazo` em ISO.
- [ ] 3.5 `RespostasSection`: grade item×lance por participante (de `useCotacao` ou de uma leitura pontual de `/{id}/ao-vivo` — resolver a Open Question no Swagger); editar lance → `useCorrigirLance`; "Reabrir resposta" por participante `RESPONDIDO` → `useReabrirParticipante`. Verificar: teste MSW — corrigir um lance reflete o novo valor; reabrir chama a API.

## 4. Resultado e pedidos

- [ ] 4.1 `ResultadoPage.tsx` (`/admin/cotacoes/:id/resultado`): `useResultado(id)` — vencedor por item pelo **nome da Empresa**, preços já vindos prontos (sem recálculo). `usePedidos(id)` — lista de pedidos com "Enviar" (`useEnviarPedido`). Botões "Baixar XLSX" e "Baixar PDF" usando a função de download binário. Verificar: teste MSW — resultado renderiza vencedores por empresa; "Enviar" atualiza o status do pedido; o clique de download chama o endpoint binário.

## 5. Fechamento

- [ ] 5.1 `npx vitest run` verde (novos testes por tela), `npx tsc -b` 0, `npm run build` completa.
- [ ] 5.2 Verificação manual contra o backend vivo (pré: `ligar-front-ao-backend`): criar cotação → adicionar itens → convidar empresa → abrir → (representante responde ou admin corrige) → encerrar → apurar → ver resultado → enviar pedido. Registrar divergências de contrato corrigidas.
- [ ] 5.3 `openspec validate admin-cotacoes` sem erros.
