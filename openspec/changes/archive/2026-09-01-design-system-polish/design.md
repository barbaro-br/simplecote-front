## Context

O design system vive em `src/index.css` (tokens oklch em `:root`, `.dark` e `.tema-claro`) e em `src/shared/components/ui/*` (button, input, card, dialog, etc.). Hoje há três blocos de drift: (1) cores cruas do Tailwind espalhadas em telas (`green-*`, `amber-*`, `blue-*`, `indigo-*`, `purple-*`, `pink-*`, `orange-*`, `emerald-*`), (2) tokens semânticos incompletos (gráficos todos cinza, sem `info`), e (3) uso inconsistente de componentes (busca com `<input>` cru, link "Nova cotação" reimplementando o estilo do botão). A motivação está em `proposal.md` — aqui só as decisões técnicas.

## Goals / Non-Goals

**Goals:**
- Uma única fonte de verdade de cor/tipografia/elevação/motion por token.
- Cores de estado legíveis nos dois temas, sem exceção de paleta fixa.
- Componentes reutilizados (sem reimplementação de estilo "na mão").

**Non-Goals:**
- Redesign de informação/navegação ou de layout.
- Novas dependências.
- Alterar regra de negócio, contrato de API ou os testes de comportamento existentes (os testes de UI podem ganhar ajustes de classe somente se o comportamento visual mudou de propósito).

## Decisions

### D1 — Estender tokens em `:root`/`.dark`/`.tema-claro`, não criar arquivo novo
Mantém a fonte única em `src/index.css` e o padrão de três blocos já existente.
- **Adicionar:** `info` + `info-foreground`; paleta cromática `chart-1..5` (cada um com chroma, em vez de cinza); tokens de sombra (`shadow-xs/sm/md/lg` mapeados à escala do Tailwind) e de motion (`--duration-*`, `--ease-*`).
- **Não adicionar** `attention` como token separado: os estados de "atenção" reusam `warning` (âmbar), evitando dois tokens com o mesmo significado. *(Refinamento em relação ao proposal, que citava "info/attention".)*
- **Alternativa considerada:** criar `src/theme.css` separado — descartada por fragmentar a fonte de verdade.

### D2 — Mapa de substituição de cor crua → token
Cada ocorrência de paleta fixa vira um token semântico, conforme a tabela abaixo (a varredura do `tasks.md` usa essa tabela como referência):

| Cor crua hoje | Uso | Token alvo |
|---|---|---|
| `green-600` / `emerald-600` | "salvo", economia positiva, check | `text-success` |
| `green-50/700 + border-green-200` | chip "enviado" | `bg-success/10 text-success border-success/30` |
| `amber-200/50/700` | aviso (itens sem preço) | `bg-warning/10 text-warning border-warning/30` |
| `blue/indigo/purple/pink/orange/amber/emerald-100+700` | avatares de empresa | tokens de avatar (D3) |

Para o `warning` em fundo claro, será necessário um primeiro plano legível (ver D3/R1) — o token atual `--warning: oklch(0.75 0.15 70)` é claro demais para texto sobre fundo claro.

- **Alternativa considerada:** manter paleta fixa e só ajustar dark mode caso a caso — descartada por não eliminar o drift e por permitir regressão futura.

### D3 — Avatares de empresa: paleta de tokens própria (não cores cruas)
A lista de avatares em `RepresentantesModal` usa 7 pares de cor fixa. Como o avatar é determinístico por empresa, introduz-se uma mini-paleta semântica (`--avatar-1..7` em `:root` e `.dark`, com bg e fg derivados) e um helper que mapeia o índice da empresa para o token. Isso mantém a variedade cromática sem quebrar o dark mode.
- **Alternativa considerada:** gerar cor por `color-mix` no CSS inline — descartada por dispersar lógica e dificultar consistência de contraste.

### D4 — Tipografia: padronizar na escala do Tailwind
Remover tamanhos arbitrários (`text-[10px]`, `[11px]`, `[13px]`, `[16px]`, `[18px]`) mapeando para a escala existente (`text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18). A hierarquia é preservada; a densidade mobile do representante usa `text-xs`/`text-sm`, não pixels soltos.
- **Alternativa considerada:** criar escala própria de tokens de fonte — descartada (Tailwind já provê a escala; duplicar aumenta superfície sem ganho).

### D5 — Componentizar: `<Input>` na busca e `asChild` no `<Button>`
- A busca de cotações passa a usar o `<Input>` existente (elimina o `<input>` cru com classes duplicadas).
- O link "Nova cotação" passa a usar `<Button asChild>` para renderizar um `<Link>` sem reescrever estilos. O `asChild` usa `Merge` do `@base-ui/react` (já dependência do projeto).
- **Alternativa considerada (fallback):** se `Merge` não cobrir o caso, extrair as classes do botão para uma constante compartilhada entre `<Button>` e o link — sem novas dependências.

### D6 — Motion: `prefers-reduced-motion` global + tokens
Adicionar um bloco `@media (prefers-reduced-motion: reduce)` em `src/index.css` que neutraliza as animações definidas (`flash-green`, `pop`, `success-pop`, `fade-in`, `shimmer`, transições de botão/sidebar). Animações de estado (spinner de sincronização) continuam, pois sinalizam progresso, não decoração.
- **Alternativa considerada:** desligar animação caso a caso em cada componente — descartada por incompleta e difícil de manter.

## Risks / Trade-offs

- **[R1] Contraste do `warning`/`success` em fundo claro** → os tokens ganham `*-foreground` escuros quando usados como texto (ex.: `warning` claro deixa de servir de texto sobre fundo claro; usa-se um `warning-foreground`). Validar visualmente nos dois temas.
- **[R2] Mudança de tamanho de fonte alterar a densidade mobile** → a troca é mecânica e próxima (11px→12px etc.); validar a tela do representante em 375px após a fase de tipografia.
- **[R3] Varredura de cores em 20+ arquivos pode pegar caso de uso não mapeado** → a tabela D2 é a referência; se surgir cor fora dela, aplicar o token mais próximo e registrar.
- **[R4] `Merge` do @base-ui não suportar o caso do botão-link** → fallback documentado em D5 (classes compartilhadas), sem nova dependência.

## Migration Plan

- Não há migração de dados/API. A mudança é só de front-end e visual.
- Aplicação faseada (ver `tasks.md`): cada fase termina com `npm run build` + `npm test` + `npm run lint` verdes.
- Rollback: reverter o commit/working tree da fase; tokens novos são aditivos e não quebram as telas não alteradas.

## Open Questions

Nenhuma — as decisões de escopo foram resolvidas acima (D1/D3/D4/D5).
