## Why

O backend expõe `GET /api/produtos/lookup?gtin=` (consulta o nome do produto num provedor externo pelo código de barras; `404` = não encontrado, normal). O spec `admin/produtos` já tem o requisito "Consulta externa por Código de Barras (GTIN)" — mas a UI nunca implementou: o `ProdutoForm` pede o nome primeiro e o código de barras é um campo opcional lá embaixo. O fluxo natural do operador de mercado é **bipar/digitar o código e deixar o sistema trazer o nome**.

## What Changes

- **Reordenar o `ProdutoForm`**: campo **Código de barras primeiro**, com um botão "Buscar" ao lado.
- **Buscar** → `GET /api/produtos/lookup?gtin=<valor>`:
  - achou → preenche o campo **Nome** (e o que mais o provedor devolver que o form use), com um aviso discreto "nome sugerido pelo código de barras";
  - `404`/não encontrado → mensagem neutra "não encontrado — preencha manualmente", o form segue editável normalmente (degrada, não trava — igual à regra do backend);
  - erro de rede/servidor → mesma degradação, sem bloquear.
- O nome continua **editável** depois de preenchido (a sugestão não é travada).
- Sem código de barras, o form funciona igual a hoje (campo opcional).
- Novo hook `useLookupProdutoPorGtin` em `produtos.api.ts` (usa `api.get(..., { lookup: true })` — a opção `lookup` já existe no `api-client` desde `alinhar-contrato-api`, faz o `404` virar `null` em vez de `ApiError`).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Realiza na UI o requisito `admin/produtos` "Consulta externa por Código de Barras (GTIN)" que já está no spec (com os cenários "Consulta com sucesso" e "Produto não encontrado → degrada"). Reordenar campos e ligar um endpoint existente não muda o contrato de spec. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- `src/admin/produtos/ProdutoForm.tsx` (ordem dos campos + bloco de busca), `src/admin/produtos/produtos.api.ts` (`useLookupProdutoPorGtin`), possível ajuste em `produtos.schema.ts` se o `DadosProdutoExternoDTO` trouxer campos aproveitáveis.
- `produtos.test.tsx`: cenários de lookup (sucesso preenche nome; 404 mostra "não encontrado" e não trava).
- **Depende de** `dialogs-reutilizaveis` (o form já estará no modal) — a reordenação acontece dentro do modal.
