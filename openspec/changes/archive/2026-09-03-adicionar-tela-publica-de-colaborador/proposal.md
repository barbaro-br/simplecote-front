## Why

Contraparte no front da change `permitir-colaborador-adicionar-itens-por-
link` (repo `simplecote-back`): o backend expõe as rotas públicas
`/public/colaborador/{token}/**`, mas precisa de uma tela para o
colaborador (funcionário do Comprador) usar — mobile-first, já que o uso
real é um funcionário com o celular andando pelo corredor da loja.

## What Changes

- Nova rota pública `/colaborador/:token`, dentro do mesmo wrapper
  `<TemaClaro>` já usado pelas telas do representante (`/cotacao/:token`,
  `/pedido/:token`) — tema claro forçado, mobile-first.
- A tela carrega `GET /public/colaborador/{token}`: se não houver Cotação
  `RASCUNHO`, mostra um estado vazio claro ("Nenhuma cotação em rascunho
  no momento — fale com o comprador"); se houver, mostra o título da
  cotação e um campo de busca de produto (nome ou código de barras,
  filtrando `GET /public/colaborador/{token}/produtos` client-side, mesmo
  padrão de busca já usado em `AdicionarItemModal.tsx` no admin).
- Ao selecionar um produto, um campo de quantidade e um botão "Adicionar"
  chamam `POST /public/colaborador/{token}/itens`; sucesso mostra
  confirmação temporária (toast) e limpa a seleção para o próximo item,
  sem sair da tela — pensado para adicionar vários itens em sequência.
- Em Configurações (`ConfiguracoesPage.tsx`), exibir a URL completa do
  link do colaborador (`{origin}/colaborador/{linkColaboradorToken}`) com
  um botão "Copiar", para o Comprador compartilhar uma vez com o time.

## Out of Scope

- Cadastro de produto novo pelo colaborador (só produtos já no catálogo)
  — mesma decisão já registrada na change do backend.
- Lista dos itens já adicionados por outros colaboradores, visível nesta
  tela em tempo real — fica como possível evolução; nesta primeira
  versão a tela só confirma o próprio envio, sem mostrar o estado
  acumulado da cotação.

## Capabilities

### Added Capabilities

- `colaborador`: nova capability cobrindo a tela pública de adicionar
  itens pelo link do colaborador.

### Modified Capabilities

- `admin/configuracoes`: requirement "Editar dados da loja" — adiciona a
  exibição do link do colaborador com botão de copiar.

## Impact

- `src/colaborador/ColaboradorPage.tsx` (novo)
- `src/colaborador/colaborador.api.ts` (novo)
- `src/colaborador/colaborador.schema.ts` (novo)
- `src/routes.tsx`
- `src/admin/configuracoes/ConfiguracoesPage.tsx`
- `src/admin/configuracoes/configuracoes.schema.ts` (campo
  `linkColaboradorToken`, somente leitura)
