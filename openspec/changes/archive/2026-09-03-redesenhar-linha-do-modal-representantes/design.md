## Context

Layout atual da linha de um participante já convidado (`RepresentantesModal.tsx`):
avatar (40px) → nome+representante (`flex-1 min-w-0`, sem `min-w` mínimo) →
badge(s) de status → até 3 ícones soltos (WhatsApp/Copiar/Reenviar) → botão
de texto ("Finalizar" ou "Reabrir resposta"). Tudo em `flex flex-wrap`
dentro de um modal `max-w-md` (448px). Com 3+ elementos de ação visíveis,
a coluna de nome é comprimida a ponto de truncar para 1 caractere.

`MenuAcoes` (`src/shared/components/ui/menu-acoes.tsx`) já existe e é usado
em `CotacoesPage.tsx`/`CotacaoDetalhePage.tsx` para agrupar ações
secundárias num ícone "⋯" com tooltip "Mais opções" — API simples:
`items: { label, onSelect, disabled?, variant? }[]`.

## Goals / Non-Goals

**Goals:**
- Nome da empresa e do representante nunca truncam para um único caractere
  em nomes de tamanho comum, independente de quantas ações a linha tem.
- Todas as ações de um participante (exceto "Convidar", que só existe
  quando ele ainda não foi convidado) ficam num único ponto de entrada
  consistente com o resto do app.

**Non-Goals:**
- Não adiciona a ação "Remover empresa" (não existe hoje; a spec só estava
  desatualizada ao mencioná-la) — fica fora de escopo, é feature nova, não
  correção de layout.
- Não muda o conteúdo das mensagens de WhatsApp/e-mail, nem a lógica de
  quando cada ação está disponível (`podeGerenciarResposta`,
  `participanteStatus`) — só onde elas aparecem na UI.

## Decisions

- **`MenuAcoes` para todas as ações de um participante já convidado**:
  Enviar por WhatsApp, Copiar link, Reenviar convite, e (quando aplicável)
  Finalizar ou Reabrir resposta — nessa ordem, como itens do menu. O botão
  de menu ("⋯") substitui os 3 ícones + o botão de texto que existem hoje.
  Rótulo do item mantido como "Reenviar convite" (o mesmo verbo/ação já
  documentado no requirement "Convidar Empresas"), não "Reenviar e-mail" —
  evita sugerir que essa ação é a mesma coisa que "Enviar por e-mail" via
  `mailto:` (ver achado abaixo, que é outra ação, hoje não implementada).
- **Coluna de nome com largura mínima garantida**: o container de
  nome+representante deixa de depender só de `flex-1 min-w-0` cedendo
  espaço; a área de ação (agora um único botão de ícone fixo) tem largura
  previsível, então a coluna de nome recebe o restante do espaço com um
  piso mínimo — evita a situação atual em que 3+ elementos de largura
  variável competem pelo mesmo espaço que o nome.
- **"Convidar" continua fora do menu**: é a única ação da linha quando o
  participante ainda não foi convidado, não compete por espaço com badge
  nenhum (o badge de status só aparece para quem já foi convidado).
- **Remove a menção a "Remover empresa"** do texto do requirement
  (inexistente na implementação, achado à parte).

## Achado à parte (fora de escopo)

Ao conferir o código para este redesign, achei que o requirement "Convidar
Empresas" já descreve, desde antes desta sessão, uma ação **"Enviar por
e-mail"** que abre um rascunho `mailto:` (função `urlMailto()`, já existe
em `compartilhar-link.ts` com teste próprio) — mas essa função nunca foi
conectada ao componente. O botão do modal com ícone de envelope hoje chama
a API de reenvio de convite (`reenviar.mutateAsync`), não `urlMailto()`. Ou
seja, a ação "Enviar por e-mail" descrita no requirement não existe de fato
na UI hoje; o que existe é só "Reenviar convite" (API).

Isso é um gap real, mas **não é resolvido por este change** — o menu "⋯"
vai agrupar as ações que realmente existem hoje (WhatsApp, Copiar,
Reenviar convite, Finalizar/Reabrir). Adicionar o item "Enviar por e-mail"
(mailto) ao menu seria uma funcionalidade nova, não um reposicionamento —
fica para o usuário decidir se quer formalizar isso como change à parte.

## Risks / Trade-offs

- [Risco] Esconder ações atrás de um clique a mais (⋯ → item do menu) pode
  parecer menos imediato que ícones visíveis — mitigado pelo fato de que
  é o mesmo padrão já usado em outras telas do produto (`CotacoesPage`,
  `CotacaoDetalhePage`), então não introduz uma interação nova pro usuário
  aprender.
