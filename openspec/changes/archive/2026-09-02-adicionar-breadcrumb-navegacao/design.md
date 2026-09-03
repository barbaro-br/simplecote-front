## Context

`ResultadoPage.tsx` (linha ~68-87) tem o título e a descrição num `div` à esquerda e, à direita, um `div flex items-center gap-4` contendo o `Button` "Baixar XLSX" e o `Link` "← Detalhe" lado a lado — é essa divisão de espaço entre um botão sólido e um link de texto pequeno que quebra visualmente em telas estreitas. `CotacaoDetalhePage.tsx` (linha ~126-137) tem um padrão parecido mas o link ("← Cotações") fica sozinho nessa linha (os botões de ação — Abrir/Encerrar/Cancelar etc. — estão numa segunda linha, `flex flex-wrap`, por isso não colide ali).

Pesquisa de UX (LogRocket, Smashing Magazine): breadcrumbs são a prática recomendada para navegação de 3+ níveis; não depender do botão "voltar" do navegador como único caminho (não é confiável em acesso direto por link, nova aba ou após refresh). A navegação de Cotações tem 3 níveis: lista de Cotações → Cotação → Resultado da apuração.

## Goals / Non-Goals

**Goals:**
- Resolver o bug de layout relatado (link espremido ao lado do botão) na raiz, não só nesse caso pontual.
- Dar ao Comprador uma forma explícita e sempre visível de voltar a qualquer nível da hierarquia (não só um nível acima).
- Reusar o mesmo componente nas duas telas, pra não divergir no futuro.

**Non-Goals:**
- Não introduz breadcrumb em outras áreas do admin (Produtos, Empresas etc.) — essas telas hoje têm no máximo 2 níveis, fora do escopo desta change.
- Não remove nem substitui o botão "voltar" do navegador — ele continua funcionando normalmente; o breadcrumb é uma via explícita adicional, não uma restrição.

## Decisions

- **Breadcrumb numa linha própria, acima do título** — nunca no mesmo container flex de um botão de ação. Estruturalmente evita a classe inteira de bug relatada (qualquer ação futura adicionada ao cabeçalho não pode mais colidir com a navegação).
- **Segmento atual (último) não é um link** — é texto simples, sinalizando "você está aqui"; os anteriores são clicáveis (`Link` do `react-router-dom`).
- **Componente genérico `Breadcrumb`, recebendo uma lista de `{label, to?}`** (o último item sem `to` é o atual) — evita duplicar a marcação de link/separador entre as duas telas, e permite reuso futuro se outra tela ganhar profundidade 3+.

## Risks / Trade-offs

- [Risco] Nenhum identificado — mudança de UI pura, sem novo endpoint nem dado que não esteja já carregado (`cotacao.titulo` já vem de `useCotacao` nas duas telas).
