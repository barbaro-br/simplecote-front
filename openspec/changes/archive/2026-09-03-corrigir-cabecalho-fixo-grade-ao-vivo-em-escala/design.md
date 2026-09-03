## Context

`GradeAoVivoTabela.tsx` (linha ~220-222): `<div className="rounded-md border ... overflow-hidden"><div className="overflow-x-auto"><table>...`. As células do cabeçalho (linha 225, 231) e a primeira coluna de cada linha (`LinhaItem`, linha 54) já usam `sticky top-0 left-0`/`sticky left-0` com `z-index` e fundo opaco corretos — a lógica de stacking já está certa, só falta um contêiner que realmente role verticalmente pra essa lógica ativar. `CotacaoDetalhePage.tsx` (linha ~125) tem seu próprio cabeçalho `sticky top-0 bg-background z-10`, de altura variável (muda conforme o status mostra mais ou menos botões).

Reproduzido ao vivo com uma Cotação de 79 itens (dados de teste, banco dev): rolando a página, o cabeçalho da grade nunca fica visível — some junto com o resto do corpo da tabela.

## Goals / Non-Goals

**Goals:**
- Fazer o cabeçalho e a coluna "Item" ficarem realmente fixos ao rolar, cumprindo o que a spec já promete.
- Reusar a mesma lógica de `sticky`/z-index já implementada nas células (não reescrever, só dar a ela um contêiner que funcione).

**Non-Goals:**
- Não introduz virtualização de linhas (windowing) — 79-200 itens renderizam bem sem isso; se um volume muito maior no futuro pedir virtualização, é uma change separada.
- Não sincroniza a altura do contêiner com a altura exata do cabeçalho da página via JS — ver Decisions.

## Decisions

- **Altura máxima fixa em unidade de viewport (`max-h-[65vh]`), não calculada dinamicamente contra a altura do cabeçalho da página.** Alternativa considerada: medir a altura real do cabeçalho da página (`ResizeObserver`) e calcular `calc(100vh - Npx)`. Rejeitada por complexidade desproporcional ao problema — o cabeçalho da página já tem sua própria margem (`mb-6`) antes da grade começar, então um valor fixo de viewport (testado nas larguras já usadas nesta sessão) resolve sem acoplar os dois componentes.
- **A tabela ganha sua própria barra de rolagem vertical, dentro do cartão** — padrão comum em tabelas de dados grandes (cabeçalho fixo "preso" ao contêiner, não à página); o usuário rola a tabela, não a página, quando ela excede a altura disponível.

## Risks / Trade-offs

- [Risco] Numa tela muito baixa (notebook pequeno, zoom alto), `65vh` pode sobrar pouco espaço pra tabela. Mitigação: é um valor ajustável — se aparecer esse caso na revisão visual, o ajuste é trivial (só o número muda).
