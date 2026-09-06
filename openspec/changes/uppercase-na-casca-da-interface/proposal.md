## Why

O usuário quer a interface em caixa alta para dar um ar mais "sistema/operacional". Aplicar em **tudo** (e-mail de representante, mensagem digitada, crédito do dev) fica feio e atrapalha leitor de tela. A decisão: caixa alta na **casca** da interface e nos **nomes de catálogo** (produto, empresa), nunca em dado pessoal ou texto livre.

## What Changes

- Via `text-transform: uppercase` (CSS, sem tocar em string), aplicar caixa alta em:
  - **Casca**: rótulos de campo, botões, títulos de página e seção, cabeçalhos de tabela, `StatusBadge`, itens de navegação (bottom nav / menu lateral), breadcrumbs, chips/tags, títulos de diálogo.
  - **Nomes de catálogo**: nome de Produto e nome de Empresa onde o sistema os exibe (tabelas, listas, cards, grade ao vivo, resultado, itens da cotação).
- **NÃO** aplicar em: e-mail, WhatsApp, tokens/links, mensagem que o representante digita, título livre de cotação digitado pelo admin? (decidir no design — ver design.md), observação de pedido, o crédito "Desenvolvido por …", campos de `input` enquanto o usuário digita.
- Locale-aware: o `text-transform: uppercase` do navegador já trata acento pt-BR corretamente (`ç` → `Ç`, `ã` → `Ã`).

## Capabilities

### Modified Capabilities

- `shared/design-system`: a linguagem visual passa a definir onde a interface usa caixa alta — casca (rótulos, botões, cabeçalhos, badges, navegação) e nomes de catálogo (produto, empresa) — e onde **não** usa (dado pessoal, texto livre, entrada do usuário).

## Impact

- `src/index.css` (camada base do design-system): classes utilitárias `.ui-uppercase` (casca) e, se necessário, um seletor por componente. Preferir aplicar via as classes dos componentes `ui/` (`button`, `badge`, cabeçalho de `table`, `breadcrumb`, `menu-acoes`, `tabs`) em vez de um seletor global agressivo.
- Componentes de casca (`src/shared/components/ui/*`, `admin/layout/*`): adicionar a classe onde faz sentido.
- Tabelas/listas de Produto e Empresa (`ProdutosPage`, `EmpresasPage`, `ItensSection`, `GradeAoVivoTabela`, `ResultadoPage`, `AdicionarItemModal`, comboboxes de seleção): caixa alta só na célula do nome.
- **Não** mexer em: `creditos-desenvolvedor.ts` render, campos de mensagem/`textarea`, exibição de e-mail/whatsapp/token, `input`/`Combobox` durante digitação.
- Testes: alguns testes que hoje casam por texto exato (`getByText('Produtos')`) continuam passando (o DOM mantém o texto original; só o `text-transform` visual muda) — verificar que nenhum teste depende de `.toHaveTextContent` com caixa transformada. Um teste do design-system garantindo que a classe utilitária existe e que um componente de casca a aplica.
- Sem dependência nova, sem mudança no back.
