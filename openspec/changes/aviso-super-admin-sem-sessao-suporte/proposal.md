## Why

Quando a sessão de suporte não é encontrada na aba (token de suporte perdido, ou navegação direta pro `/admin` como `SUPER_ADMIN`), o `AuthGuard` já manda de volta pro `/backoffice` — mas hoje isso é silencioso: o analista só vê o backoffice aparecer no lugar do painel do lojista, sem entender por quê. A mudança `modo-suporte-sobrevive-a-descarte-de-aba` reduziu bastante a chance disso acontecer, mas não elimina — resta explicar quando ainda acontecer, do mesmo jeito que `SessaoExpiradaBridge` já avisa "Sessão de suporte expirada." no caminho irmão (401 durante o modo suporte).

## What Changes

- `AuthGuard`: ao detectar `papel === 'SUPER_ADMIN'` numa rota `/admin/**` (o mesmo caso que já redireciona pro backoffice), mostra um aviso (`toast.warning`) antes/durante o redirect. Não dá pra distinguir com certeza "sessão de suporte perdida" de "SUPER_ADMIN navegou direto pro /admin por engano" — o texto é neutro e verdadeiro nos dois casos: "Sessão de suporte não encontrada nesta aba — entre novamente pelo backoffice."

## Capabilities

### Modified Capabilities

- `backoffice`: o redirect de SUPER_ADMIN saindo do `/admin` explica o motivo em vez de ser silencioso.

## Impact

- `src/shared/auth/AuthGuard.tsx`: `useEffect` + `toast.warning` quando `papel === 'SUPER_ADMIN'`.
- `src/shared/auth/AuthGuard.test.tsx`: novo teste cobrindo o aviso.
- Sem dependência nova. Sem mudança de contrato com o back.
