## Why

Par do back `backoffice-notas-e-auditoria`: o detalhe da loja no backoffice passa a ter notas livres do `SUPER_ADMIN` e uma linha do tempo consolidada (cadastro, verificação, suporte, suspensões, prazo, exclusão, notas). Falta a UI.

## What Changes

- **Detalhe da loja** ganha uma seção **"Notas e histórico"**:
  - Caixa para escrever uma nota nova (`POST .../notas`) + lista das notas existentes com autor, data e botão remover (`DELETE .../notas/{notaId}`).
  - Abaixo, a **timeline** (`GET .../timeline`): lista vertical com ícone por tipo, data relativa, ator e descrição. Tipos: cadastro, verificação de e-mail, suporte, suspensão, reativação, prazo alterado, exclusão, nota.
- **Não** muda rotas, o guard nem as ações existentes do detalhe.

## Capabilities

### Modified Capabilities

- `backoffice`: o detalhe de uma loja mostra notas livres (criar/remover) e uma linha do tempo consolidada dos acontecimentos da loja.

## Impact

- `src/backoffice/backoffice.api.ts`: `useNotas(id)` → `GET .../notas`; `useAdicionarNota(id)` → `POST .../notas`; `useRemoverNota(id)` → `DELETE .../notas/{notaId}`; `useTimeline(id)` → `GET .../timeline`.
- `src/backoffice/backoffice.schema.ts`: `Nota` (id, texto, autorSuperAdminId, criadoEm), `TimelineItem` (tipo, quando, ator, descricao).
- `src/backoffice/CompradorDetalhePage.tsx`: nova seção "Notas e histórico" (ou componente `NotasEHistorico.tsx`) — formulário de nota, lista de notas, timeline; estados carregando/vazio/erro; confirmação leve ao remover uma nota (sem `window.confirm` — usar o padrão de confirmação inline já usado na zona de perigo).
- `src/backoffice/` — helper `iconePorTipoEvento` / `rotuloTipoEvento`.
- Testes: `backoffice.test.tsx` — adicionar uma nota chama `POST .../notas` e ela aparece na lista; remover chama `DELETE`; a timeline renderiza itens de tipos diferentes do mock em ordem.
- Sem dependência nova. Seção 0 = o back (`backoffice-notas-e-auditoria`).
