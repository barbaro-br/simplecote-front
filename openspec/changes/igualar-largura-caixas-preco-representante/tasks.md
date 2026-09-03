## 1. Igualar as larguras

- [ ] 1.1 Em `ItemLanceCard.tsx`, na caixa do P.UN (`<div className="rounded-lg border border-border bg-card px-2 py-1">` que envolve o `<span>{unitario}</span>`): adicionar uma largura mínima (`min-w-[…]`) e `justify-center`/`text-center`, calibrada para comportar o texto mais longo esperado ("calculando…") sem folga excessiva quando o conteúdo é curto ("—").

## 2. Testes

- [ ] 2.1 Teste (snapshot ou assert de classe): a caixa do P.UN tem a classe de largura mínima aplicada nos três estados (vazio, calculando, com valor).
- [ ] 2.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): comparar lado a lado a largura renderizada das caixas P.CX e P.UN nos três estados do P.UN (vazio, calculando, com valor) e ajustar o `min-w` se necessário até ficarem visualmente alinhadas.
