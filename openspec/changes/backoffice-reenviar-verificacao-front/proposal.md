## Why

Par do back `backoffice-reenviar-verificacao`: o `SUPER_ADMIN` passa a poder reenviar o e-mail de verificação de um OWNER travado no cadastro, e o detalhe informa `admins[].emailVerificado`. Falta a UI.

## What Changes

- No **detalhe da loja**, na lista de administradores: cada admin mostra um selo "e-mail verificado" ou "não verificado". Para um admin **não verificado**, aparece um botão **"Reenviar verificação"** → `POST /api/admin/compradores/{id}/reenviar-verificacao` → toast de confirmação ("E-mail de verificação reenviado").
- Se todos os admins estão verificados, nenhum botão aparece.
- **Não** muda rotas, guard nem as outras ações.

## Capabilities

### Modified Capabilities

- `backoffice`: o detalhe da loja mostra o status de verificação de e-mail de cada admin e um botão para reenviar a verificação de um OWNER não verificado.

## Impact

- `src/backoffice/backoffice.schema.ts`: `Admin` ganha `emailVerificado: boolean`.
- `src/backoffice/backoffice.api.ts`: `useReenviarVerificacao(id)` → `POST /api/admin/compradores/{id}/reenviar-verificacao`; invalida o detalhe no sucesso.
- `src/backoffice/CompradorDetalhePage.tsx`: na seção de administradores, selo de verificação + botão condicional "Reenviar verificação" com estado de carregando; erro do back em toast.
- Testes: `backoffice.test.tsx` — admin não verificado mostra o botão e clicar chama `POST .../reenviar-verificacao`; admin verificado não mostra o botão.
- Sem dependência nova. Seção 0 = o back (`backoffice-reenviar-verificacao`).
