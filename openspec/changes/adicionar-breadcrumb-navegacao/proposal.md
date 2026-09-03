## Why

O link "← Detalhe" no topo da tela de Resultado da apuração está espremido na mesma linha do botão "Baixar XLSX", e numa tela estreita quebra em duas linhas de um jeito visualmente quebrado. A tela de detalhe da Cotação tem um link equivalente ("← Cotações"), sozinho na sua própria linha — não quebra, mas resolve só um nível (sempre volta pra lista, nunca direto pra Cotação quando se está no Resultado).

A navegação do admin de Cotações tem 3 níveis (Cotações → Cotação → Resultado da apuração) — profundidade em que a prática de UX estabelecida (breadcrumb para navegação 3+ níveis; não depender só do botão voltar do navegador, que não é confiável em link direto/nova aba/refresh) recomenda um breadcrumb, não um link solto de "voltar um nível".

## What Changes

- Novo componente `Breadcrumb` (`src/shared/components/ui/breadcrumb.tsx`): trilha de links horizontal, cada segmento clicável exceto o atual.
- `ResultadoPage.tsx`: troca o link "← Detalhe" por `Cotações › {título da Cotação} › Resultado`, numa linha própria acima do título (nunca dividindo espaço com "Baixar XLSX").
- `CotacaoDetalhePage.tsx`: troca o link "← Cotações" por `Cotações › {título da Cotação}`, mesma posição/padrão.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes`: novo requirement — navegação entre as telas de Cotações via breadcrumb, substituindo os links de "voltar um nível" atuais.

## Impact

- `src/shared/components/ui/breadcrumb.tsx` (novo) — componente reutilizável.
- `src/admin/cotacoes/ResultadoPage.tsx` — troca o link atual pelo breadcrumb, em linha própria.
- `src/admin/cotacoes/CotacaoDetalhePage.tsx` — troca o link atual pelo breadcrumb, mesma posição.
- Nenhuma dependência de backend — só reorganização de UI usando dados já carregados (`cotacao.titulo` já vem de `useCotacao`).
