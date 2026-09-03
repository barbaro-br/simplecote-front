## Why

A spec já promete cabeçalho e coluna de item fixos ao rolar (`admin/cotacoes`, "Grade ao vivo da Cotação"), mas isso nunca foi verificado com uma Cotação de verdade com muitos itens — só com poucos, onde a página nem chega a rolar o suficiente pra expor o problema. Testado agora com uma Cotação real de 79 itens: ao rolar, o cabeçalho da grade (nomes das Empresas) **não fica fixo** — ele rola junto com o corpo da tabela, e o cabeçalho fixo da página (título/breadcrumb/botões, que tem seu próprio `sticky top-0`) fica sobreposto ao conteúdo da tabela de um jeito visualmente quebrado.

Causa raiz: o wrapper da tabela (`GradeAoVivoTabela.tsx`) só tem `overflow-x-auto` (rolagem horizontal) — não tem altura limitada nem `overflow-y-auto` próprios. Por isso quem rola verticalmente é a página inteira, não a tabela; e `position: sticky` nas `<th>` só "gruda" de verdade dentro de um contêiner que efetivamente rola naquele eixo. Sem esse contêiner, o `sticky top-0` das `<th>` não tem efeito nenhum contra o scroll da página.

## What Changes

- `GradeAoVivoTabela.tsx`: o wrapper da tabela ganha altura máxima e `overflow-y-auto` próprios (ex.: `max-h-[calc(100vh-Xpx)]`, calculado a partir do espaço já ocupado pelo cabeçalho fixo da página), virando um contêiner de rolagem de verdade — dentro dele, `sticky top-0`/`sticky left-0` nas células passam a funcionar como já é descrito na spec.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: o requirement da grade ao vivo é ajustado pra descrever o mecanismo real (contêiner de rolagem próprio, com o cabeçalho fixo dentro dele) em vez de depender do scroll da página inteira.

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx` — wrapper com altura limitada e `overflow-y-auto`.
- Nenhuma mudança de backend.
