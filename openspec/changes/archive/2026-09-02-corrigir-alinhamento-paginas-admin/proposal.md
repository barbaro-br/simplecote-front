## Why

A spec `admin/layout` já exige (Requirement "Conteúdo centralizado na área útil do painel", cenário "Uniformidade entre rotas") que **todas** as rotas `/admin/**` sigam a mesma regra de centralização, sem comportamento divergente entre telas. O shell (`AdminLayout.tsx:145`) já implementa isso corretamente (`mx-auto w-full max-w-7xl p-8`).

O bug: 9 páginas colocam seu próprio `<div className="max-w-5xl">` (ou `max-w-4xl`/`max-w-lg`) como raiz do conteúdo, **sem** `mx-auto`. Como esse `max-w-*` é mais estreito que o `max-w-7xl` do shell, o conteúdo fica colado à esquerda dentro da área já centralizada, em vez de centralizado — violando diretamente o cenário "Uniformidade entre rotas" já especificado. É a percepção relatada de "a tela não está exatamente no meio".

## What Changes

- Introduzir um componente compartilhado `PageContainer` (`src/shared/components/layout/PageContainer.tsx`) que aplica `mx-auto` junto com a largura máxima da página, para que essa classe de bug não se repita a cada página nova.
- Migrar as 9 páginas afetadas para usá-lo, preservando a largura máxima que cada uma já tem hoje:
  - `AnalisesPage.tsx`, `DashboardPage.tsx`, `CotacoesPage.tsx`, `ResultadoPage.tsx`, `EmpresasPage.tsx`, `ProdutosPage.tsx`, `UsuariosPage.tsx` — `max-w-5xl`
  - `CotacaoDetalhePage.tsx` — `max-w-4xl`
  - `NovaCotacaoPage.tsx` — `max-w-lg`

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

_Nenhuma — o requirement de centralização já existe em `admin/layout` e já está sendo violado pela implementação. Esta change corrige a implementação para cumprir o spec existente; não muda o que o spec exige._

## Impact

- 9 arquivos de página em `src/admin/**/*Page.tsx` (troca de `<div className="... max-w-*">` pelo novo `<PageContainer maxWidth="...">`).
- 1 arquivo novo: `src/shared/components/layout/PageContainer.tsx`.
- Puramente visual/estrutural — nenhuma mudança de dado, API ou lógica de negócio.
