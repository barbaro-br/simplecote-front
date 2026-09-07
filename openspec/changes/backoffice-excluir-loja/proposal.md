## Why

O backoffice tem suspender/reativar/resetar-senha/entrar-como-suporte, mas não tem como **excluir** uma loja. O operador do SaaS precisa disso para limpar lojas de teste e cadastros abandonados (contas que nunca verificaram o e-mail) sem esperar a carência de 30 dias da LGPD. E, ao chegar em `backoffice.simplecote.app` sem sessão, hoje o app mostra a **home de marketing** (o host neutro não tem slug) — deveria ir pro login.

Change pequena, par do back `backoffice-excluir-comprador`.

## What Changes

- **Excluir loja** no `CompradorDetalhePage`: ação "Excluir loja permanentemente" com confirmação forte (digitar o slug da loja), que chama `POST /api/admin/compradores/{id}/excluir`. Sucesso → volta para a lista com um aviso; a loja some da lista.
- **Entrada do backoffice**: em `backoffice.simplecote.app` (host reservado, sem slug) sem sessão, o `/` vai para `/login` — não para a home de marketing. Depois de logar, o `SUPER_ADMIN` já cai em `/backoffice` (comportamento atual do `AuthGuard`).
- **Não** muda os outros fluxos do backoffice nem o `/` nos hosts de marketing/loja.

## Capabilities

### Modified Capabilities

- `backoffice`: o `SUPER_ADMIN` pode excluir uma loja pelo detalhe (confirmação forte); a entrada em `backoffice.simplecote.app` sem sessão leva ao login.

## Impact

- `src/backoffice/backoffice.api.ts`: `useExcluirComprador(id)` → `POST /api/admin/compradores/{id}/excluir` (204).
- `src/backoffice/CompradorDetalhePage.tsx`: seção "Zona de perigo" com a ação; `ConfirmarDialog` (ou campo de texto) exigindo o slug exato; erro do backend na tela; sucesso → `navigate('/backoffice')` + toast.
- `src/site/Raiz.tsx` (ou onde o `/` decide): quando `ehHostDoApp` e o host é reservado do backoffice (`backoffice.*`) e não há sessão → `Navigate to="/login"` em vez de `HomePage`. Reusa `SLUGS_RESERVADOS`/`ehHostDoApp` de `src/shared/domain/slug.ts` — não duplica parsing.
- Testes: `backoffice.test.tsx` — excluir pede o slug certo (botão desabilitado até bater), confirma → chama a API e sai da tela, erro do backend aparece; `Raiz`/rota — `backoffice.simplecote.app` sem sessão renderiza o login, não a home.
- Sem dependência nova. Seção 0 = o endpoint do back (`backoffice-excluir-comprador`).
