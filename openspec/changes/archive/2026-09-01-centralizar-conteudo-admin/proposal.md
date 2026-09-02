## Why

O container de conteúdo do painel admin (ao lado da sidebar) é renderizado alinhado à esquerda, deixando um vão em branco desproporcional no lado direito em monitores largos/ultrawide. O bug se repete em todas as rotas internas (`/admin`, `/admin/cotacoes`, `/admin/produtos`, …) e dá ao painel uma aparência "quebrada" em resoluções altas.

## What Changes

- O `AdminLayout` passa a centralizar o conteúdo dentro da área útil da página por meio de um wrapper interno com largura máxima e margens automáticas (`max-w-7xl`, `mx-auto`, `w-full`) e padding lateral.
- O `<main>` continua ocupando todo o espaço restante ao lado da sidebar (`flex-1`), preservando o comportamento atual de colapso/expansão da sidebar.
- A centralização é aplicada uma única vez no layout global (`AdminLayout`), não tela a tela.

## Capabilities

### New Capabilities
- `admin/layout`: o shell do painel administrativo — em especial o container principal que envolve o conteúdo das rotas internas e a regra de centralização do conteúdo dentro da área útil da página.

### Modified Capabilities

## Impact

- `src/admin/layout/AdminLayout.tsx` — adição do wrapper interno de centralização no `<main>`.
- `src/admin/layout/AdminLayout.test.tsx` — possíveis ajustes/novos testes de presença das classes de centralização.
- Sem mudança de API, dependências ou comportamento de dados. Afeta somente a apresentação das rotas sob `/admin/**`.
