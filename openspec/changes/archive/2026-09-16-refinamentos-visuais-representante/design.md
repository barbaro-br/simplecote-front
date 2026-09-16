## Design
- `LinhaPreco.tsx`: Alterar `bg-[var(--pnl-superficie,#12263f)]` para uma cor de card baseada no grid ao vivo (ex. `bg-black/20` ou `bg-muted/30` para gerar contraste de planilha).
- `CondicoesResposta.tsx`: Corrigir qualquer estilo inline ou classes que forcem bg claro.
- `CotacaoPorTokenPage.tsx`:
  - Encontrar `<Superficie>` e garantir `rounded-none`.
  - Título `<SecaoCabecalho titulo={d.titulo} ... />`: Aplicar `ui-uppercase`.
  - Subfaixa: alterar a copy para `Olá, {nome}. Você está cotando pela {empresa} para {comprador}.` com tamanho de fonte um pouco maior.
  - Substituir o `<Selo>` arredondado por um badge construído in-loco (ou ajustar as props, se o Selo permitir `rounded-none`). Injetar bolinha com `animate-ping` se aberta.
