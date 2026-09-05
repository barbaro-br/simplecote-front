## Why

A tela pública do colaborador (`/colaborador/:token`) hoje mira uma única Cotação `RASCUNHO` implícita e só permite adicionar produtos já existentes no catálogo via busca por texto. Isso está desalinhado com o back, que já mudou (change `permitir-colaborador-adicionar-itens-cotacao-aberta` do `simplecote-back`, mesclada e testada) para mirar a Cotação `ABERTA` — e vai mudar de novo (change irmã `permitir-colaborador-escolher-cotacao-aberta` do back) para suportar múltiplas cotações abertas simultâneas, deixando o colaborador escolher. Além disso, o uso real de chão de loja é bipar o código de barras com a câmera do celular, não digitar o nome do produto — o back já expõe os endpoints de lookup e cadastro bipado, mas o front nunca usa.

## What Changes

- **Cabeçalho de cotações abertas**: a tela consome a nova forma de `GET /public/colaborador/{token}` (lista de Cotações `ABERTA`, não mais uma só). Com 1 cotação aberta, mostra o título dela normalmente (comportamento atual preservado visualmente). Com mais de uma, mostra um seletor no topo (ex: abas horizontais roláveis) para escolher em qual incluir o próximo item — raro na prática, mas suportado. Com nenhuma, mensagem "nenhuma cotação aberta no momento" (troca o texto de "rascunho" para "aberta"). **BREAKING** para o formato consumido de `EstadoColaborador`.
- **Adicionar item por busca de catálogo**: fluxo atual preservado, mas o `POST .../itens` passa a enviar também o `cotacaoId` da cotação selecionada no cabeçalho.
- **Bipar código de barras**: novo botão "Bipar código de barras" que abre a câmera (`getUserMedia` + `@zxing/browser`, dependência já instalada) em tela cheia/modal. Ao ler um GTIN: consulta `GET .../produtos/lookup?gtin=`; se encontrar (200), pré-preenche nome/marca e pede só a quantidade; se não encontrar (404), abre um formulário para o colaborador digitar nome, unidade, quantidade por embalagem e quantidade. Em ambos os casos, confirma com `POST .../produtos/bipado` incluindo o `cotacaoId` da cotação selecionada.
- **Permissão de câmera negada/indisponível**: a tela SHALL degradar para o fluxo de busca por texto existente, sem travar a tela com erro.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `colaborador`: o requirement "Tela pública de adição de itens pelo colaborador" é removido e substituído por "Tela pública de adição de itens pelo colaborador na cotação aberta" (Cotação `ABERTA`, não `RASCUNHO`, com cabeçalho de escolha entre múltiplas cotações abertas); entra o novo requirement "Adicionar item pela câmera (bipagem de código de barras)".

## Impact

- `src/colaborador/colaborador.schema.ts`: `EstadoColaborador` vira `{ nomeLoja, cotacoesAbertas: { id, titulo }[] }`; novos tipos para a resposta do lookup (`{gtin, nome, marca}`) e para o corpo do cadastro bipado.
- `src/colaborador/colaborador.api.ts`: `useEstadoColaborador` reflete a lista; `useAdicionarItemColaborador` ganha `cotacaoId` no corpo; novos hooks `useLookupProdutoColaborador` (GET, 404 é resultado válido, não erro) e `useCadastrarItemBipadoColaborador` (POST).
- `src/colaborador/ColaboradorPage.tsx`: cabeçalho com seletor de cotação (estado local: cotação selecionada, default = primeira da lista); novo componente/estado para o modo câmera; textos "rascunho" → "aberta".
- Novo componente de leitura de câmera (ex: `src/colaborador/LeitorCodigoBarras.tsx`), usando `@zxing/browser` (já em `package.json`, zero dependência nova).
- Testes: `ColaboradorPage.test.tsx` cobre 0/1/N cotações abertas no cabeçalho, e os dois caminhos de bipagem — o acesso real à câmera é mockado (não há câmera real em CI/jsdom), conforme detalhado em `design.md`.
- Depende das duas changes do `simplecote-back` (`permitir-colaborador-adicionar-itens-cotacao-aberta` já mesclada; `permitir-colaborador-escolher-cotacao-aberta` ainda não) estarem no ar antes deste front ir para produção — sem isso, o front quebra ao ler uma resposta que ainda não existe.
