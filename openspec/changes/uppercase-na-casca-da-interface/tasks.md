## 1. Camada base

- [ ] 1.1 `src/index.css`: utilitário `.ui-uppercase { text-transform: uppercase; }` (e, se útil, aplicar direto nas classes dos componentes `ui/`)
- [ ] 1.2 Confirmar `<html lang="pt-BR">` no `index.html` (caixa alta locale-aware para acentos)

## 2. Casca

- [ ] 2.1 Componentes `ui/`: `button`, `badge`/`StatusBadge`, cabeçalho de `table` (`<th>`), `breadcrumb`, `tabs` (rótulo de aba), `menu-acoes` — caixa alta
- [ ] 2.2 `admin/layout/*`: itens da bottom nav / menu lateral, títulos de página (`h1`) e de seção
- [ ] 2.3 `<label>` de formulário e títulos de `Dialog` — caixa alta

## 3. Nomes de catálogo

- [ ] 3.1 Célula do nome de **Produto** em: `ProdutosPage`, `ItensSection`, `AdicionarItemModal`, `GradeAoVivoTabela`, `ResultadoPage`
- [ ] 3.2 Célula do nome de **Empresa** em: `EmpresasPage`, `GradeAoVivoTabela` (coluna), `ResultadoPage`, `RepresentantesModal`

## 4. Fora do escopo (garantir que NÃO recebe)

- [ ] 4.1 E-mail / WhatsApp / token / link mágico; mensagem digitada; observação do pedido; crédito do dev; título da cotação (valor); texto em `input`/`textarea`/`Combobox` durante digitação

## 5. Testes

- [ ] 5.1 `grep` por asserts que esperam texto já em caixa alta (`toHaveTextContent('...')` maiúsculo) — ajustar se houver
- [ ] 5.2 Teste do design-system: um componente de casca (ex.: `Button`) aplica `text-transform: uppercase`; um campo de e-mail não
- [ ] 5.3 `npm test` + `npm run build` + `npm run lint` verdes
