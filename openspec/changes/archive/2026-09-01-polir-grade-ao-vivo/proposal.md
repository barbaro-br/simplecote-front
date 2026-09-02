## Why

A grade ao vivo da cotação (tabela comparativa de preços por Empresa) está visualmente "crua" em quatro pontos: alinhamento inconsistente entre o cabeçalho das distribuidoras e o conteúdo das células, estados vazios (`PENDENTE`/`NÃO COTOU`) renderizados como texto solto, seletor de quantidade com bordas pesadas competindo com o menor preço, e o preço `COTADO` padrão "flutuando" sem a moldura de cartão que o selo `MENOR` tem. Polir esses pontos deixa a grade mais legível e confiável para quem opera a cotação no dia a dia.

## What Changes

- Alinhar à direita (`text-right`) o cabeçalho das Empresas e os preços/status das células, padronizando a leitura dos valores financeiros.
- Renderizar os estados vazios `PENDENTE` e `NÃO COTOU` como badges sutis (pílula com fundo claro, texto menor e mais opaco) em vez de texto solto.
- Refinar o seletor de quantidade (`[-] n [+]`): botões menores, bordas mais suaves e menos padding interno, tornando-o secundário em relação ao nome do item.
- Dar ao preço `COTADO` padrão (não-menor) uma borda fina + fundo branco (`rounded-md`), no mesmo formato de "cartão" do preço menor, mantendo a simetria da grade.

## Capabilities

### New Capabilities

### Modified Capabilities

- `admin/cotacoes`: a grade ao vivo ganha polimento visual (alinhamento à direita, badges de estado vazio, seletor de quantidade refinado e cartão de preço padrão).

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx` — único arquivo de implementação (classes/estrutura dos elementos da grade).
- `src/admin/cotacoes/GradeAoVivoTabela.test.tsx` — testes de apresentação (presença das classes/badges/alinhamento).
- Sem mudança de API, dado ou regra de negócio. **Fora de escopo:** a linha de "Valor Total Estimado por distribuidora" (item 5 do pedido) — é valor derivado que deveria vir pronto da API, então exige mudança no `simplecote-back` e não entra nesta change.
