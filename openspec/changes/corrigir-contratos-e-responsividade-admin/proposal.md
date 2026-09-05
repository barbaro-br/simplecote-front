## Why

O painel admin tem três defeitos de contrato/estrutura confirmados contra o backend real e um conjunto de achados menores pendentes: (1) o popover de insight de produto quebra em toda resposta com dados porque o schema Zod do front não espelha o contrato de `GET /api/analises/produtos/insight` (nomes de campos **e** tipos: dinheiro vem como número e a série vem como array de objetos `{data, precoUnitario}`); (2) a tela de Configurações nunca fala com a API — é um mock em memória, então nada do que se salva sobrevive ao recarregar e o link do colaborador é um placeholder fixo; (3) em telas estreitas a sidebar não colapsa para menu mobile e a página rola horizontalmente por inteiro. Além disso, testes do `ConfiguracoesPage` estão quebrados contra a UI nova (abas), a validação de "Qtd. por embalagem" mostra mensagem do Zod em inglês, e o commit de flash da grade trocou o contêiner de rolagem para `overflow-auto max-h-[70vh]` fora do padrão canônico.

## What Changes

- **Insight de produto fiel ao contrato real**: o schema passa a espelhar a resposta do back — `ultimaCompra` (empresa, representante, precoUnitario **number**, data, quantidade, cotacaoId), `variacaoPct` number|null, `menorPrecoUnitario` number|null, `precoMedioUnitario90d` number|null, `compras` number, `fornecedoresDistintos` number, `serie` como array de `{data, precoUnitario}`. O card e o `Sparkline` passam a consumir números diretamente (sem `parseNum` de string) e a série desenha o gráfico a partir de `precoUnitario`. O insight derivado localmente no `UltimaCompraPopover` (grade) usa o mesmo formato. **BREAKING para o código do front**: os campos `menorPreco`/`media90d`/`numeroCompras`/`numeroFornecedores` deixam de existir.
- **Configurações ligada à API real**: `configuracoes.api.ts` troca o mock em memória por `GET /api/configuracoes` e `PUT /api/configuracoes` (contrato já existente no back; `linkColaboradorToken` é somente leitura). As alterações passam a persistir e o link do colaborador passa a ser o token real da loja. O toggle "Destacar menor preço na grade" é **removido** do formulário (o backend não tem esse campo; decisão do dono: o destaque permanece ativo como comportamento padrão da grade, e o campo volta quando o back o suportar) — a grade deixa de ler a preferência e mantém o destaque ligado.
- **Shell responsivo**: abaixo de 768px a sidebar vira um drawer oculto aberto por botão hamburger numa topbar; o conteúdo ocupa a largura toda; tabelas/grade continuam com rolagem própria (sem rolar a página inteira). Acima de 768px o comportamento expandir/recolher atual é preservado.
- **Grade ao vivo**: contêiner volta ao padrão canônico `overflow-x-auto overflow-y-auto max-h-[65vh]` (rolagem vertical própria com cabeçalho fixo), desfazendo o `overflow-auto max-h-[70vh]` do commit de flash; teste realinhado.
- **Correções menores**: mensagens de validação de "Qtd. por embalagem" em pt-BR no schema Zod (cobrindo `number`/`int` — hoje o erro de valor não inteiro sai em inglês); testes do `ConfiguracoesPage` realinhados à UI de abas; redundância das mensagens de "trocar senha" já resolvida no working tree é preservada e coberta por teste; comportamento "editar produto sem fechar o modal de listagem" (código e teste já concordam no working tree) é mantido sem mudança de produto.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `admin/painel-insights`: o requirement "Insight de compra ao passar sobre um produto" ganha o contrato explícito dos campos/formatos do insight (nomes, dinheiro como número, série de pontos), para que a validação Zod nunca mais divirja do back sem quebrar a spec.
- `admin/configuracoes`: o requirement "Alternar destaque do menor preço na grade ao vivo" é **removido** (o toggle sai da tela; destaque permanece como comportamento padrão ligado, já coberto pelo requirement da grade em `admin/cotacoes`); o requirement "Editar dados da loja" ganha clareza de que a persistência é via `GET/PUT /api/configuracoes` reais e que o link do colaborador vem do token retornado pela API.
- `admin/layout`: o requirement "Painel utilizável em larguras estreitas" passa a exigir drawer + hamburger abaixo de 768px (em vez de sidebar em modo ícone), com conteúdo em largura total e rolagem de página sem transbordamento horizontal.
- `admin/produtos`: o requirement "Cadastro de Novo Produto" passa a exigir mensagens de validação locais em português, incluindo valor não inteiro para a quantidade por embalagem.
- `admin/cotacoes`: o requirement "Grade ao vivo da Cotação" ganha um cenário fixando o contêiner de rolagem própria com altura limitada (65vh) e overflow separado por eixo — para o flash/outras mudanças não reverterem esse comportamento sem alterar a spec.

## Impact

- `src/admin/analise/analise.schema.ts`, `InsightProdutoCard.tsx`, `Sparkline.tsx` (e testes): contrato do insight alinhado ao back (tipos number e série de pontos).
- `src/admin/cotacoes/UltimaCompraPopover.tsx`: insight derivado da grade no mesmo formato.
- `src/admin/configuracoes/configuracoes.api.ts`: remove mock (`CONFIGURACAO_SEED`, `definirConfiguracaoMock`, `resetarMock`, `definirFalhaAoSalvar`) e liga `GET/PUT /api/configuracoes`; `configuracoes.schema.ts` perde `destacarMenorPrecoNaGrade`.
- `src/admin/configuracoes/ConfiguracoesPage.tsx`: remove o toggle de destaque; form reflete só os campos do contrato.
- `src/admin/cotacoes/GradeAoVivoTabela.tsx`: deixa de ler `destacarMenorPrecoNaGrade` da configuração (destaque sempre ligado, já era o default); contêiner volta a `overflow-x-auto overflow-y-auto max-h-[65vh]`.
- `src/admin/layout/AdminLayout.tsx`: topbar + drawer mobile abaixo de 768px (novo estado no shell; BottomNavBar de `estiloNavegacao` continua intocado).
- `src/admin/produtos/produtos.schema.ts`: mensagens pt-BR para `number`/`int` da quantidade por embalagem.
- Testes afetados: `analise/*` (shape novo), `configuracoes/*` (MSW no lugar dos helpers de mock; UI de abas), `GradeAoVivoTabela.test.tsx` (65vh), `UsuariosPage.test.tsx` (sem regressão nas mensagens de senha), `AdminLayout` (novo comportamento mobile).
- Dependências: nenhuma nova. Contrato do back já existe (`GET/PUT /api/configuracoes`, insight com dinheiro número).
