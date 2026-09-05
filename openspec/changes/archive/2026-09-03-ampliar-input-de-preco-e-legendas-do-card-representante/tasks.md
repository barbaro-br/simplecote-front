## 1. Ajustar tamanhos no card

- [x] 1.1 Em `ItemLanceCard.tsx`: trocar `w-14` do `<input>` de P.CX (linha do `className` do input de preço) por uma largura maior o suficiente para exibir "9.999,99" sem rolagem interna (testar empiricamente no navegador — ex.: `w-20` ou similar).
- [x] 1.2 Ajustar `min-w-[72px]` da caixa de P.UN para o valor que mantém as duas caixas (P.CX e P.UN) visualmente com a mesma largura final renderizada, nos três estados do P.UN ("—", "calculando…", valor formatado).
- [x] 1.3 Trocar os dois `text-[9px]` dos rótulos "P.CX" e "P.UN" para `text-[10px]`.
- [x] 1.4 Trocar o `text-[11px]` da linha de embalagem/quantidade (`<p className="mt-0.5 text-[11px] text-muted-foreground">{unitText}</p>`) para `text-xs`.
- [x] 1.5 NÃO alterar os demais `text-[9px]`/`text-[10px]`/`text-[11px]` do arquivo (badge "Novo", índice, código de barras, mensagem de status) — fora de escopo desta change.

## 2. Testes

- [x] 2.1 Atualizar/conferir `ItemLanceCard.test.tsx` (se cobrir classes específicas de largura/tamanho) para refletir os novos valores.
- [x] 2.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [x] 3.1 Testar manualmente (dev, viewport 375px): digitar um preço de embalagem com 4 dígitos inteiros e centavos (ex.: "9999,99") e confirmar que o valor fica totalmente visível no campo sem cortar/rolar. **(verificado visualmente pelo dono do produto em 05/09/2026)**
- [x] 3.2 Confirmar visualmente que as caixas de P.CX e P.UN continuam com a mesma largura entre si nos três estados do P.UN. **(verificado visualmente pelo dono do produto em 05/09/2026)**
- [x] 3.3 Confirmar que a linha de nome do produto + badges (índice, "Novo", código de barras) continua numa única linha em 375px, sem quebrar — já que essa linha não foi alterada, mas a largura maior do P.CX ao lado pode indiretamente apertar o espaço disponível para o nome do produto (`truncate` já existente deve continuar cobrindo isso). **(verificado visualmente pelo dono do produto em 05/09/2026)**
