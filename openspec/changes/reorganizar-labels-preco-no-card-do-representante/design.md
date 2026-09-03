## Context

`ItemLanceCard.tsx` (linha ~211-237): bloco à direita do card, `<div className="flex items-center gap-2">`, contém em sequência horizontal: (1) o input de preço da embalagem (com prefixo "R$" dentro de uma caixa com borda), (2) um `<span>` com o texto `unidade. R$ {precoUnitario}` (largura fixa `md:w-24` = 96px, `whiteSpace: nowrap`), (3) o `VistoStatus` (ícone 20×20px). Medido ao vivo: o texto do item (2) precisa de 112px reais (`scrollWidth`) mas só tem 96px (`clientWidth`) — comprovado o overflow.

Pesquisa de UX (ver Why): label empilhado > label inline em formulários mobile densos; abreviações precisam de posição consistente entre itens (nunca mudar de lugar) e reforço no onboarding (que este app já tem); o valor calculado (preço unitário) deve continuar como texto simples, nunca estilizado como input.

## Goals / Non-Goals

**Goals:**
- Resolver o overflow na raiz (menos competição por espaço horizontal), não só aumentando a largura do container (que só adiaria o problema pra nomes/valores maiores).
- Deixar explícito pro representante o que cada valor representa — hoje só tem "R$" no input, sem indicar "isso é o preço da caixa".
- Manter a hierarquia visual já validada: preço da embalagem (editável) com mais peso que o preço unitário (calculado, só leitura).

**Non-Goals:**
- Não muda o cálculo do preço unitário nem o autosave — só a apresentação.
- Não adiciona tooltip/popover explicando as abreviações — o reforço fica no tutorial de primeira visita (onboarding), que já existe e já é o lugar certo pra isso (não introduzir um segundo mecanismo de ajuda).

## Decisions

- **"P.CX" e "P.UN" como rótulos, sempre na mesma posição relativa (acima do valor) em todo item** — consistência de posição é a mitigação padrão pra abreviações não 100% óbvias (achado da pesquisa), então nenhum item pode ter os rótulos em posição diferente.
- **Rótulos em fonte pequena, `uppercase`, cor `text-muted-foreground`** — mesmo padrão visual já usado pros outros textos auxiliares do card (ex.: o texto de embalagem "fd com 20un · comprar 10"), não introduz um novo padrão de rótulo.
- **Preço da embalagem continua sendo um `<input>` com borda (afeta editável); preço unitário continua sendo `<span>` de texto simples (sinaliza só-leitura)** — a pesquisa confirma que essa distinção visual (bordered/editável vs. texto plano/calculado) já é a prática correta, só reorganiza o espaço ao redor dela.
- **Reforço das abreviações no tutorial, não um tooltip novo** — o tutorial de primeira visita já existe e já é onde o app ensina convenções da tela (ex.: o gesto de deslizar, na change anterior); adicionar mais uma UI de ajuda (tooltip) seria redundante.

- **Rótulo centralizado sobre o campo (`items-center`), não alinhado à direita da coluna (`items-end`)** — achado ao testar ao vivo: com `items-end`, o rótulo "P.CX" ficava colado à borda direita da caixa do input, enquanto o "R$" dentro da caixa começa à esquerda — o rótulo parecia deslocado em relação ao número que descreve. Centralizado, o rótulo fica visualmente acima do campo inteiro, não só de uma borda dele.

## Risks / Trade-offs

- [Risco] O card fica um pouco mais alto (rótulo + valor empilhados ocupam mais altura que lado a lado) — aceitável; a lista já rola verticalmente, e o ganho de legibilidade/espaço horizontal compensa.
