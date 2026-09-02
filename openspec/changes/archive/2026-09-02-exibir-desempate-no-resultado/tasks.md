## 1. Schema

- [x] 1.1 Em `src/admin/cotacoes/cotacoes.schema.ts`: adicionar `decididoPorDesempate?: boolean` ao tipo `ItemPedido`.

## 2. UI

- [x] 2.1 Em `src/admin/cotacoes/ResultadoPage.tsx`: quando `item.decididoPorDesempate` for `true`, exibir um badge (ex.: usando o componente `Badge` já existente no design system) ao lado do preço, com `title`/tooltip explicando "Empate de preço — decidido por ordem de resposta".
- [x] 2.2 Garantir que o badge não aparece quando o campo é `false` ou `undefined`.

## 3. Testes

- [x] 3.1 Teste (React Testing Library): item com `decididoPorDesempate: true` renderiza o badge.
- [x] 3.2 Teste: item com `decididoPorDesempate: false`/ausente não renderiza o badge.
- [x] 3.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
