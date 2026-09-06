## Why

A tela do colaborador (`/colaborador/:token`) é usada no celular, no chão da loja, mas ainda tem fricções de UX: o cabeçalho (cotação/loja) rola junto com a lista e se perde; só é possível cadastrar um produto **depois** de bipar (o form de "produto não encontrado" só aparece após um lookup de GTIN falhar), não dá para cadastrar um item manualmente sem escanear; e o Comprador não recebe nenhum sinal explícito quando o colaborador adiciona um item à cotação — ele só percebe vendo a grade atualizar por polling.

## What Changes

- **Front (colaborador)** — cabeçalho fixo (sticky) com título da cotação e nome da loja, otimizado para retrato no celular.
- **Front (colaborador)** — ação "Cadastrar produto" acessível sem bipar: abre o mesmo formulário (nome, unidade, qtd/embalagem, quantidade) diretamente, sem exigir um GTIN.
- **Front (colaborador)** — feedback mais claro ao incluir item (confirmação visual + toast), mantendo a tela pronta para o próximo item.
- **Front (admin)** — toast em tempo real quando um colaborador adiciona item a uma cotação aberta, via evento SSE.
- **Back (change irmã de mesmo nome em `simplecote-back`)** — permitir cadastro de item **sem GTIN** (endpoint/`gtin` opcional) e emitir evento SSE de item adicionado pelo colaborador.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `colaborador`: cabeçalho fixo + cadastro de produto sem bipar + feedback de inclusão.
- `admin/cotacoes-live-stream`: feedback de item adicionado pelo colaborador (toast no admin via SSE).

## Impact

- **Front (este repo):** `src/colaborador/ColaboradorPage.tsx` (header fixo, botão "Cadastrar produto", feedback), `src/colaborador/colaborador.api.ts`/`colaborador.schema.ts` (cadastro sem GTIN), `src/admin/cotacoes/cotacoes.api.ts` (listener SSE + toast), e testes.
- **Back (change irmã em `simplecote-back`):** `ColaboradorCadastrarItemBipadoRequest` (gtin opcional) ou novo endpoint sem GTIN em `PublicColaboradorController`, e evento SSE de item adicionado no stream da grade ao vivo.
- **Sem mudança de contrato de apuração/resultado** — só a superfície do colaborador e o stream de feedback.
