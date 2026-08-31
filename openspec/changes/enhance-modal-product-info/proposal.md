## Why

O modal de "Carrinho" ficou rápido e fluido, mas a falta de contexto da embalagem pode causar confusão: o usuário pode pedir quantidade "8" de um produto achando que são 8 unidades, quando na verdade o produto foi cadastrado como "Caixa com 12" (o que daria 96 unidades no total). Além disso, a leitura de muitos itens pode ser cansativa na formatação atual.

## What Changes

1. **Maior espaço e contraste:**
   - Aumentar a largura do modal de `lg` para algo maior (`max-w-4xl` ou similar) para caber as informações sem apertar.
   - Reforçar o padrão de "linhas zebradas" (zebra striping) e bordas, para guiar a leitura dos olhos na horizontal.

2. **Informações Ricas do Produto:**
   - Exibir na segunda linha (embaixo do nome do produto, com fonte menor e cor suave) a informação de embalagem que já vem da API (ex: `Caixa com 12`, `Fardo com 6`, ou `Unidade`).

3. **Sobre edição de Embalagem (Unidade vs Caixa) na Cotação:**
   - Atualmente, a estrutura do backend (`Produto` vs `ItemCotacao`) define que a embalagem é uma propriedade amarrada ao cadastro do *Produto*. A cotação apenas tira uma "foto" (snapshot) dessa embalagem.
   - Portanto, **não podemos editar a embalagem diretamente no momento de adicionar à cotação** sem uma mudança estrutural gigantesca no backend. A regra de negócio padrão de atacados é: se você quer comprar a unidade solta, você cadastra um produto "Açúcar 1kg (Unidade)". Se quer comprar fardo, cadastra "Açúcar 1kg (Fardo c/ 10)".
   - O que faremos: Ao mostrar "Caixa com 12" claramente, o usuário entenderá que o campo "quantidade: 8" se refere a "8 caixas".

## Impact

- Redução drástica de erros de digitação de quantidade, já que o comprador agora sabe o multiplicador da embalagem.
- UI mais limpa, escaneável e confortável para lidar com catálogos gigantes.
