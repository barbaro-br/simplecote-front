## Why

O fluxo atual de criação de cotações (um wizard passo a passo longo) e a visualização da aba de Pedidos (lista densa sem agrupamento visual claro) geram muito atrito cognitivo para os Compradores. O laboratório feito na prova de conceito `new-front` (via Google Stitch) provou que uma interface consolidada para cotação e um agrupamento em formato sanfona/sticky-header por empresa na aba de pedidos melhoram drasticamente a usabilidade. 

Faremos essa migração trazendo a UI validada para dentro do `simplecote-front` atual protegido por um **Feature Flag** ("Experimentar Novo Visual"). Isso permite inovar a interface com zero risco, mantendo toda a infraestrutura invisível crítica do SaaS intacta (sincronização offline, roteamento de subdomínios, validação com Zod).

## What Changes

- **Inclusão de Feature Flag**: Adição de um switch/botão no perfil do Comprador (salvo no `localStorage` ou banco) para alternar entre "Visual Antigo" e "Novo Visual".
- **Nova Cotação Consolidada**: Injeção da marcação e classes Tailwind do layout gerado pelo Stitch para substituir o wizard longo por uma visão mais direta (`<CotacaoFormV2 />`).
- **Nova Tabela de Pedidos (Sanfona)**: Criação de um componente `<PedidosV2 />` que exibe um cabeçalho clicável (ou fixo com scroll) para cada empresa ganhadora. Clicar no cabeçalho expande os itens e quantidades correspondentes daquela empresa.
- As chamadas de API, esquemas Zod e o tratamento offline permanecem estritamente os atuais. O código dos componentes antigos (`V1`) será intocado.

## Capabilities

### New Capabilities
- (Nenhuma capacidade de domínio nova. A mudança é estritamente na Interface/UX.)

### Modified Capabilities
- (As regras de negócio continuam as mesmas. Arquivo `.openspec.yaml` atualizado com `skip_specs: true`).

## Impact

- **UX do Comprador**: Ganha a possibilidade de optar pela interface nova mais rápida e limpa sem perder os dados.
- **Risco**: Risco quase nulo de quebrar a aplicação em produção devido ao uso do isolamento por Feature Flag.
- **Código**: Aumento temporário do tamanho do bundle do painel devido à coexistência da V1 e V2 até a V1 ser deprecada no futuro.
