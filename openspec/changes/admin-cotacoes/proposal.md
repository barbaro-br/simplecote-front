## Why

Cotação é o coração do SimpleCote e hoje as rotas `/admin/cotacoes/*` são `<div>` placeholder. Sem elas o Comprador não consegue montar uma cotação, convidar empresas, abrir, apurar nem ver resultado — ou seja, não há o que demonstrar. O backend já expõe todo o ciclo (`/api/cotacoes/**`); falta a interface.

## What Changes

- **Dashboard** (`/admin`): lista de cotações do Comprador agrupada/filtrável por status (`GET /api/cotacoes`), com atalho "Nova cotação".
- **Criar** (`/admin/cotacoes/nova`): formulário de título (`POST /api/cotacoes` → `RASCUNHO`), e opção "duplicar de uma existente" (`POST /api/cotacoes/{id}/duplicar`).
- **Detalhe** (`/admin/cotacoes/:id`, `GET /api/cotacoes/{id}`): 
  - Itens (só em `RASCUNHO`): adicionar por produto (`POST /{id}/itens`), remover (`DELETE /{id}/itens/{itemId}`).
  - Participantes: convidar Empresas por seleção (`POST /api/cotacoes/{id}/participantes` com `empresaIds`), reenviar convite (`POST /api/participantes/{pid}/reenviar-convite`), copiar link mágico.
  - Ações de estado com **diálogo de confirmação nomeando a consequência** (regra 8 do `spec.md`): abrir com `prazo` (`POST /{id}/abrir`), encerrar (`/encerrar`), reabrir (`/reabrir`), cancelar (`/cancelar`), apurar (`/apurar`).
  - Correção de lance pelo admin (`PUT /api/participantes/{pid}/lances/{itemId}`) e reabrir resposta de um participante (`POST /api/participantes/{pid}/reabrir`).
- **Resultado** (`/admin/cotacoes/:id/resultado`, `GET /api/cotacoes/{id}/resultado`): vencedores por item (com `empresaNome`, não representante), lista de pedidos (`GET /{id}/pedidos`), enviar pedido (`POST /api/pedidos/{id}/enviar`), baixar XLSX (`GET /{id}/resultado.xlsx`) e PDF do pedido (`GET /api/pedidos/{id}.pdf`).
- Feature-folder `src/admin/cotacoes/` no padrão da fatia de referência (`*.schema.ts`, `*.api.ts`, páginas, formulários) + testes MSW por tela (caminho feliz + erro), incluindo o teste do diálogo de confirmação nas ações irreversíveis.

## Capabilities

### New Capabilities
- `admin/cotacoes`: gestão do ciclo de vida da Cotação no painel — criar/duplicar, montar itens, convidar Empresas, transições de estado (abrir/encerrar/reabrir/cancelar/apurar) com confirmação, correção de lance e reabertura de resposta, e visualização de resultado/pedidos com exportação.

### Modified Capabilities
Nenhuma.

## Impact

- Novo: `src/admin/cotacoes/**` (páginas, forms, `cotacoes.api.ts`, `cotacoes.schema.ts`, testes), rotas em `src/routes.tsx` (substituindo os placeholders), link "Cotações" no `AdminLayout`.
- Leitura: tipos de `src/shared/domain/tipos-base.ts` (`StatusCotacao` etc. — depende de `alinhar-contrato-api` ter corrigido o enum).
- Depende de `ligar-front-ao-backend` (fluxo admin validado) e, para os union types corretos, de `alinhar-contrato-api`.
- **Fora de escopo**: grade ao vivo com polling (`GET /{id}/ao-vivo`, `spec.md` §10.1 / Fase 2) — follow-up.
