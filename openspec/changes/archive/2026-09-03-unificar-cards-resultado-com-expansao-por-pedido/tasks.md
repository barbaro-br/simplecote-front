## 1. Unificar os cards

- [x] 1.1 Em `ResultadoPage.tsx`: remover o segundo `<Card>` ("Vencedor por item") e a derivação `vencedores` (flatMap), mantendo `resultado.data.pedidos` como a única fonte de itens por pedido.
- [x] 1.2 Adicionar `const [expandidos, setExpandidos] = useState<Set<string>>(new Set())` e uma função `alternarExpansao(pedidoId: string)` que adiciona/remove do set.
- [x] 1.3 Na linha de cada pedido (dentro do único `<Card>` "Pedidos Gerados"): adicionar um botão de expandir/recolher (ícone chevron, `aria-expanded`) antes ou depois da coluna Empresa, chamando `alternarExpansao(pedido.id)`.
- [x] 1.4 Quando `expandidos.has(pedido.id)`: renderizar uma `<tr>` adicional com `colSpan` completo contendo uma tabela aninhada dos itens de `pedido.itens` — colunas Produto / Preço da embalagem / Preço unitário (com o badge de "Empate" quando `item.decididoPorDesempate`) / Subtotal — reaproveitando a formatação (`moeda`, classes) que a antiga tabela "Vencedor por item" já usava.
- [x] 1.5 Mover o bloco de "Itens sem vencedor" (`resultado.data.itensSemVencedor`) para dentro do único `<Card>` restante, como uma seção abaixo da tabela de pedidos (mesma apresentação de hoje).

## 2. Testes

- [x] 2.1 Atualizar `ResultadoPage.test.tsx` (se existir) ou criar testes cobrindo: a tela renderiza um só card de pedidos (não mais "Vencedor por item" como card separado).
- [x] 2.2 Teste: expandir um pedido mostra seus itens (produto, preços, subtotal); recolher esconde de novo.
- [x] 2.3 Teste: item com `decididoPorDesempate: true` mostra o badge de empate dentro da linha expandida.
- [x] 2.4 Teste: "Itens sem vencedor" continua aparecendo quando existem, independente do estado de expansão de qualquer pedido.
- [x] 2.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): apurar uma cotação com 2+ empresas vencedoras e itens sem vencedor, expandir e recolher cada pedido, confirmar que os totais/badges/itens batem com o que estava nos dois cards antigos.
