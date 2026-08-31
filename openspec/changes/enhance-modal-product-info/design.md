## Technical Design

### UI Changes (AdicionarItemModal.tsx)
- Mudar tamanho do `<Dialog>` para `size="xl"` ou similar, para não espremer os novos dados.
- Onde renderizamos o `p.nome`, transformar num flex container de coluna.
- Embaixo do nome, renderizar uma string baseada na `unidade` e `quantidadePorEmbalagem`.
- String rule: 
  - Se `unidade` for "Unidade" e `qtd === 1`, exibir "Unidade"
  - Senão, exibir "{unidade} com {qtd}" (ex: "Caixa com 12")
- Melhorar o destaque zebrado, talvez usando `bg-muted/10` vs `bg-background` de forma mais assertiva.

