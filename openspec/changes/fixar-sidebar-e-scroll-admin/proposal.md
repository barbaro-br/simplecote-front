## Why

`AdminLayout.tsx` monta o shell como `<div className="flex min-h-screen">` com a `<aside>` (menu) e o `<main className="flex-1 overflow-hidden">` como irmãos num flex row — nenhum dos dois tem altura fixa nem scroll próprio. Quando o conteúdo de uma rota é mais alto que o viewport (ex.: a grade ao vivo de uma cotação com muitos itens), é o **documento inteiro** que rola, e como a `<aside>` não é fixa/sticky, ela rola junto e some da tela. O usuário perde acesso ao menu de navegação exatamente quando mais precisa navegar (no meio da leitura de uma tela longa).

## What Changes

- A `<aside>` (sidebar) passa a ficar fixa na altura da viewport (`h-screen` + `sticky top-0` ou equivalente), nunca saindo de vista ao rolar o conteúdo.
- O `<main>` passa a ser o **próprio limite de scroll** (`h-screen overflow-y-auto`) em vez do documento — a página não rola mais como um todo.
- **Atenção a uma dependência existente**: `GradeAoVivoTabela.tsx` já usa `sticky top-0`/`sticky left-0` para fixar o cabeçalho e a primeira coluna da tabela, e isso funciona hoje justamente porque o scroll acontece no documento (sem container intermediário). Mover o scroll para dentro de `<main>` muda o contexto de sticky — é preciso verificar, como parte desta change, que o header/coluna da grade ao vivo continua fixo corretamente dentro do novo container de scroll.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/layout`: novo requirement — a navegação (sidebar) permanece visível durante o scroll do conteúdo de qualquer rota `/admin/**`, e o scroll passa a ocorrer dentro da área de conteúdo, não no documento inteiro.

## Impact

- `src/admin/layout/AdminLayout.tsx` — reestruturação do shell (root, `<aside>`, `<main>`).
- `src/admin/layout/AdminLayout.test.tsx` — provavelmente precisa de ajuste/novos casos.
- `src/admin/cotacoes/GradeAoVivoTabela.tsx` — validação (e possível ajuste) do sticky header/coluna sob o novo container de scroll; tratado a fundo na change seguinte (`compactar-grade-ao-vivo`), mas a verificação básica de que nada quebrou é escopo desta change.
- Afeta visualmente **todas** as rotas `/admin/**` (é o shell raiz), não só uma tela — por isso vem antes de qualquer polimento específico de tela.
