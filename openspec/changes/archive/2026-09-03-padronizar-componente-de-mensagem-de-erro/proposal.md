## Why

Achado a partir do relato do usuário ("erro vermelho abaixo do campo de
busca em Cotações") e confirmado no código: o projeto tem **dois** padrões
visuais coexistindo para erro de ação — um "cru" (`role="alert"
className="text-sm text-destructive font-medium"`, só texto vermelho solto,
usado em `CotacoesPage.tsx` e `CotacaoDetalhePage.tsx`) e um mais completo
(fundo `bg-destructive/10`, borda, às vezes ícone — usado em
`EsqueciSenhaPage`, `RedefinirSenhaPage`, `UsuarioForm`,
`RedefinirSenhaForm`, `EmpresaForm`, `ProdutoForm`, entre outros). O texto
solto sem contorno é o que o usuário descreveu como "aquele erro interno
todo de vermelho" — visualmente destoa do resto do produto.

## What Changes

- Criar um componente compartilhado `ErrorAlert`
  (`src/shared/components/ui/error-alert.tsx`), consolidando o padrão já
  mais completo (fundo `bg-destructive/10`, borda `border-destructive/30`,
  ícone de alerta, `role="alert"`) usado hoje em vários formulários.
- Trocar os dois usos do padrão "cru" (`CotacoesPage.tsx` e
  `CotacaoDetalhePage.tsx`) pelo novo `<ErrorAlert>`.
- **Fora de escopo**: não migrar os outros ~14 usos que já seguem o padrão
  bom hoje (eles continuam funcionando; podem ser trocados pelo componente
  compartilhado depois, oportunisticamente, sem necessidade de uma
  varredura forçada agora).

## Capabilities

### Added Capabilities

- `shared/design-system`: novo requirement "Componente padronizado de
  mensagem de erro" — define o padrão visual único (fundo, borda, ícone)
  que mensagens de erro de ação devem seguir, com as duas telas que hoje
  usam o padrão "cru" como primeiros casos migrados.

## Impact

- `src/shared/components/ui/error-alert.tsx` (novo)
- `src/admin/cotacoes/CotacoesPage.tsx`
- `src/admin/cotacoes/CotacaoDetalhePage.tsx`
