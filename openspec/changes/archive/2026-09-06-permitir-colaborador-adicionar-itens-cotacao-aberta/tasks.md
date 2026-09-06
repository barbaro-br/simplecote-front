## 1. Schema e API — lista de cotações abertas

- [x] 1.1 Em `colaborador.schema.ts`, trocar `EstadoColaborador` para `{ nomeLoja: string; cotacoesAbertas: { id: string; titulo: string }[] }`; adicionar tipos `ProdutoExternoLookup` (`{gtin, nome, marca}`) e `CadastrarItemBipadoValores` (`{cotacaoId, gtin, nome, unidade, quantidadePorEmbalagem, quantidade}`)
- [x] 1.2 Em `colaborador.api.ts`, atualizar `useEstadoColaborador` para o novo shape; `useAdicionarItemColaborador` passa a enviar `{cotacaoId, produtoId, quantidade}`
- [x] 1.3 Adicionar `useLookupProdutoColaborador(token, gtin)` (`GET .../produtos/lookup?gtin=`, 404 é resultado válido — não usar `retry`/lançar erro nesse caso, resolver como "não encontrado")
- [x] 1.4 Adicionar `useCadastrarItemBipadoColaborador(token)` (`POST .../produtos/bipado`)
- [x] 1.5 Rodar `npx vitest run src/colaborador/colaborador.api.test.tsx` (criar se não existir) — verde

## 2. Cabeçalho de cotações abertas

- [x] 2.1 Em `ColaboradorPage.tsx`, adicionar estado local `cotacaoSelecionadaId` (default: primeira de `cotacoesAbertas`, a mais recente)
- [x] 2.2 Renderizar cabeçalho: sem cotação aberta → mensagem "nenhuma cotação aberta no momento" (texto trocado de "rascunho"); 1 cotação → título simples (sem seletor); N cotações → abas horizontais roláveis, a selecionada destacada
- [x] 2.3 `useAdicionarItemColaborador` e `useCadastrarItemBipadoColaborador` usam `cotacaoSelecionadaId` como `cotacaoId`
- [x] 2.4 Testes em `ColaboradorPage.test.tsx`: 0/1/N cotações abertas no cabeçalho; trocar de aba muda a cotação-alvo dos próximos itens adicionados — `npx vitest run src/colaborador/ColaboradorPage.test.tsx` verde

## 3. Leitor de código de barras

- [x] 3.1 Criar `LeitorCodigoBarras.tsx`: overlay full-screen com `<video>`, usa `BrowserMultiFormatReader` de `@zxing/browser` para leitura contínua; botão fechar; trata `NotAllowedError`/ausência de câmera exibindo aviso e voltando ao fluxo de busca por texto
- [x] 3.2 Testar `LeitorCodigoBarras` com `@zxing/browser` mockado (`vi.mock`) disparando um GTIN fixo no callback — sem depender de câmera real; cobrir também o caminho de permissão negada
- [x] 3.3 Em `ColaboradorPage.tsx`, adicionar botão "Bipar código de barras" que abre o `LeitorCodigoBarras`

## 4. Fluxo pós-bipagem

- [x] 4.1 Ao ler um GTIN, chamar `useLookupProdutoColaborador`; se encontrado, ir direto pra tela de quantidade com nome/marca pré-preenchidos (reaproveitar o card de confirmação já existente para produto selecionado, adaptado pra also aceitar dado vindo do lookup em vez do catálogo)
- [x] 4.2 Se não encontrado (404), abrir formulário com nome, unidade, quantidade por embalagem e quantidade (campos editáveis, nome sem valor inicial)
- [x] 4.3 Confirmar em qualquer um dos dois casos chama `useCadastrarItemBipadoColaborador` com o `cotacaoId` selecionado; sucesso mostra toast e volta pro estado inicial (busca/bipar), como já acontece na adição via catálogo
- [x] 4.4 Testes: cenário "encontrado" e "não encontrado" ponta a ponta (leitura mockada → lookup mockado via MSW → POST bipado mockado) — `npx vitest run src/colaborador` verde

## 5. Checagem de saúde

- [x] 5.1 `npx vitest run` completo — verde, sem regressão
- [x] 5.2 `npx tsc -b` e `npx oxlint` — sem erro novo

