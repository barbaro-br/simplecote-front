## Context

Ver `proposal.md`. Hoje `AdminLayout.tsx` tem 6 itens de menu (`Dashboard`, `Cotações`, `Produtos`, `Empresas`, `Usuários`, `Análises`); com `configuracoes-da-loja-basico` aplicada, vira 7 (`+ Configurações`). O layout atual é um único `flex` horizontal sem nenhum tratamento de breakpoint mobile.

Nota: uma auditoria visual posterior confirmou na prática o risco de "não há tratamento mobile" descrito abaixo — achou corte real de texto em telas estreitas, corrigido separadamente em `corrigir-responsividade-painel-admin` (sidebar colapsa automaticamente abaixo de 768px). Essa correção é independente desta change: ela resolve o bug de quebra na sidebar atual; esta change aqui continua sendo a feature de escolha manual de estilo (lateral/inferior), útil mesmo depois daquele bug corrigido.

## Goals / Non-Goals

**Goals:**
- O lojista pode escolher entre sidebar lateral e barra inferior, e essa escolha vale para todas as rotas.
- Os dois estilos preservam os requirements já existentes de `admin/layout` (centralização, navegação visível durante scroll).

**Non-Goals:**
- Não é responsivo automático por breakpoint — é escolha manual e fixa, conforme confirmado com o usuário (mesmo que isso signifique um comportamento visualmente incomum em telas muito largas — ver Risco abaixo).
- Não é uma preferência por usuário — é uma configuração da loja (todo mundo que acessa aquele painel vê o mesmo estilo).

## Investigação de viabilidade (pedida explicitamente antes de decidir)

**É tecnicamente viável.** O risco não é técnico, é de UX, e tem duas partes:

1. **Barra inferior é um padrão pensado para telas estreitas (celular).** No Instagram/Facebook ela funciona porque a tela é estreita e os ícones são universalmente reconhecíveis (casa, busca, coração, perfil) sem precisar de texto. O SimpleCote é um painel de back-office com 7 seções nomeadas (Dashboard, Cotações, Produtos, Empresas, Usuários, Análises, Configurações) — ícones sozinhos são bem menos autoexplicativos aqui do que "coração = curtir". Aplicado numa tela de desktop larga, uma barra fina embaixo com 7 ícones pequenos tende a ser **menos** clara que a sidebar atual (que já mostra rótulo por padrão).
2. **7 itens não cabem confortavelmente numa barra inferior.** O padrão de mercado (IG/FB/apps mobile em geral) usa no máximo ~5 itens visíveis na barra; além disso, agrupa o resto atrás de "Mais". Preciso aplicar o mesmo padrão aqui, senão os ícones ficam apertados demais ou o texto desaparece.

**Minha recomendação**: construir mesmo assim, já que é uma escolha explícita do lojista (não estou decidindo por ele) — mas com o escopo abaixo, que mitiga os dois pontos acima, em vez de tentar espremer 7 ícones sem rótulo numa barra.

## Decisions

- **Barra inferior mostra 4 itens fixos + "Mais"**: `Dashboard`, `Cotações`, `Produtos`, e um botão "Mais" que abre um menu/sheet com `Empresas`, `Usuários`, `Análises`, `Configurações`. Alternativa considerada: rolagem horizontal com os 7 ícones. Rejeitada — rolagem horizontal numa barra de navegação é um padrão confuso (usuário pode não perceber que há mais itens fora da tela); "Mais" é o padrão já usado por apps mobile reais para esse exato problema.
- **Barra inferior mantém rótulo de texto abaixo do ícone** (não só ícone), diferente do IG/FB — porque, como dito acima, os ícones do SimpleCote não são universalmente autoexplicativos como os de uma rede social. Isso ocupa mais altura de barra, mas prioriza clareza sobre a estética "minimalista" do padrão original.
- **Expand/collapse (hoje existente na sidebar) só se aplica ao estilo `Lateral`.** No estilo `Inferior` não existe esse conceito — a barra é sempre do mesmo tamanho.
- **A troca de estilo é imediata e visível em toda sessão ativa** (não exige logout/reload) — mesma mecânica de qualquer config aplicada via contexto React.

## Risks / Trade-offs

- [Risco] Numa tela de desktop muito larga, uma barra fixa embaixo com 4-5 itens pode parecer "perdida"/desproporcional em vez de elegante (diferente do celular, onde ocupa a largura toda naturalmente) → Mitigação: nenhuma automática — é uma escolha explícita do lojista; se o resultado visual não agradar, ele volta pra `Lateral` a qualquer momento pelas próprias Configurações. Vale uma conferência visual (dev server) antes de considerar a change concluída, não só a implementação mecânica.
- [Risco] Dobra a superfície de teste do shell (`AdminLayout.test.tsx`) permanentemente — toda mudança futura no shell precisa validar os dois estilos → Mitigação: aceito conscientemente, é o preço de oferecer a escolha; task de teste dedicada garante que os dois estilos ficam cobertos desde o início.
- [Risco] Esta change depende de duas outras (`configuracoes-da-loja-basico`, `fixar-sidebar-e-scroll-admin`) já aplicadas — aplicar fora de ordem quebra a integração → Mitigação: ordem de execução documentada e a ser respeitada.
