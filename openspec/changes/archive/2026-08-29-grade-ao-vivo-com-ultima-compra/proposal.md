## Why

O backend expõe `GET /api/cotacoes/{id}/ao-vivo` (grade de lances por item × Empresa, com menor preço e referência de última compra), mas o front **nunca construiu essa tela** — era Fase 2 do `spec.md` (§10.1/§10.5). Sem ela o Comprador não acompanha as respostas chegando. E, com `ultima-compra-por-produto` (back), a resposta passa a trazer preço + Empresa + data da última compra por item — matéria-prima pra o Comprador ter análise em tempo real ("saiu a R$ 10,00 na Atacado União; agora está a R$ 15,00").

## What Changes

- **Nova tela `/admin/cotacoes/:id/ao-vivo`** — grade: linhas = itens, colunas = Empresas convidadas. Cada célula: status (`COTADO`/`NAO_COTADO`/`PENDENTE`), preço da embalagem, preço unitário; menor preço unitário do item destacado. Cabeçalho com "respondidos / total".
- **Polling** (`spec.md` §10.1): `useQuery` com `refetchInterval: 5000` **enquanto** a Cotação está `ABERTA`; `refetchInterval: false` quando sai de `ABERTA`; pausa quando a aba perde foco (default do TanStack Query). Link pra essa tela no detalhe da Cotação.
- **Última compra no hover**: ao passar o mouse sobre um item (a linha / o nome do produto), um popover mostra a **referência de última compra** — preço unitário, Empresa vencedora, data (formatada pt-BR / São Paulo). Se o produto nunca foi comprado, o popover diz "sem compra anterior". Comparação visual leve com o menor preço atual (subiu / desceu).
- **Correção de lance a partir da grade**: cada célula tem o `participanteId` (o back já manda) → clicar numa célula abre o modal de correção de lance (reusa `useCorrigirLance` de `admin-cotacoes` / `admin-cotacoes-participantes-respostas`).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `admin/cotacoes`: novo requisito "Grade ao vivo da Cotação" (tela + polling + correção pela célula) e "Referência de última compra no hover".

## Impact

- Novo: `src/admin/cotacoes/GradeAoVivoPage.tsx`, `GradeAoVivoTabela.tsx`, `UltimaCompraPopover.tsx`; hook `useGradeAoVivo(id)` em `cotacoes.api.ts`; tipos da grade em `cotacoes.schema.ts` (`GradeAoVivo`, `ItemGrade`, `Celula` com `ultimaCompraEmpresa`/`ultimaCompraEm`).
- Rota `cotacoes/:id/ao-vivo` em `src/routes.tsx`; link no `CotacaoDetalhePage`.
- Reuso do `Dialog` e de `useCorrigirLance`.
- Testes: grade renderiza células por status; polling liga em `ABERTA` e desliga fora; popover de última compra (com dado e sem); clicar na célula abre a correção.
- **Depende de** `ultima-compra-por-produto` (back — os campos `ultimaCompra*` na resposta) e coordena com `shell-e-tema` (cores/badges) e `dialogs-reutilizaveis` (modal de correção).
