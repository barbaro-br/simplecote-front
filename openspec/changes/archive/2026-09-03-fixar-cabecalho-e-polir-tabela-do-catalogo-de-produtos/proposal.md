## Why

Testado ao vivo (sessão 2026-09-03, com 206 produtos cadastrados no
catálogo de dev): ao rolar a lista de produtos, tanto o título "Catálogo
de produtos" + botão "Novo produto" quanto a linha de cabeçalho da
tabela (Nome/Código de barras/Embalagem/Qtd./Ações) somem — diferente da
grade ao vivo da tela de detalhe de Cotação, que já tem esse
comportamento fixo. Com um catálogo grande, isso obriga rolar de volta
ao topo toda vez que se perde a referência de qual coluna é qual.

Também verificado ao vivo: a coluna "Qtd./embalagem" cola sem respiro na
coluna "Ações" — os dois grupos (texto alinhado à direita + ícones)
ficam visualmente colados, sem separação clara entre onde termina um
dado e começa uma ação.

## What Changes

- Tornar o bloco de título + subtítulo + botão "Novo produto" fixo no
  topo (`sticky top-0`), no mesmo padrão já usado no cabeçalho da tela
  de detalhe de Cotação (`CotacaoDetalhePage`: `sticky top-0 bg-background
  z-10 border-b`).
- Dar à tabela (dentro do `Card`) seu **próprio contêiner de rolagem
  vertical com altura limitada** e cabeçalho de colunas fixo no topo
  desse contêiner — mesmo padrão arquitetural já usado e especificado
  para a grade ao vivo (`GradeAoVivoTabela`: "próprio contêiner de
  rolagem vertical... cabeçalho fica fixo no topo"), replicado aqui para
  a tabela de produtos.
- Encurtar o rótulo da coluna de "Qtd./embalagem" para "Qtd." e
  adicionar uma separação visual mais clara antes da coluna "Ações" (ex.:
  borda vertical sutil ou padding adicional), para os dois grupos não
  parecerem coladas.
- Trocar o ícone de "Inativar" de `EyeOff` para `Archive` (mais
  intuitivo como "tirar do catálogo ativo" do que "esconder"), e o de
  "Ativar" de `Eye` para `ArchiveRestore` — só nesta tela; o componente
  compartilhado `IconButton` ganha um novo prop opcional `tone?:
  'default' | 'destructive'` (default `'default'`, sem mudar nenhum uso
  existente) para dar ao ícone de "Inativar" um tom de alerta sutil no
  hover, sem virar um botão vermelho agressivo.

## Capabilities

### Modified Capabilities

- `admin/produtos`: requirement "Listagem do Catálogo" — cabeçalho da
  página e da tabela fixos ao rolar, coluna "Qtd." com rótulo mais curto
  e separada visualmente das ações, ícones de inativar/ativar trocados.

## Impact

- `src/admin/produtos/ProdutosPage.tsx`
- `src/shared/components/ui/icon-button.tsx` (novo prop opcional `tone`,
  compatível com todos os usos existentes)
