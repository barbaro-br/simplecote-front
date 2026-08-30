## Context

Conforme descrito no `proposal.md`, a tela `RepresentantesModal` não exibe os canais de contato disponíveis para cada representante ao selecioná-los para uma cotação. Os dados de contato (`email` e `whatsapp`) já são retornados pela API (em `useRepresentantes` / `Representante`).

## Goals / Non-Goals

**Goals:**
- Mostrar ícones de WhatsApp e E-mail de forma clara, porém não intrusiva, na lista de seleção.

**Non-Goals:**
- Adicionar funcionalidades de disparo de mensagem/e-mail para os ícones *na etapa de seleção*. Os ícones são apenas indicadores visuais.

## Decisions

1. **Uso de Ícones do Lucide**: Utilizaremos os ícones `Mail` e `Phone` (ou `MessageCircle`/`Smartphone`) da biblioteca `lucide-react` para manter a consistência com o restante do modal (que já usa `Send`, `Mail`, `Copy`).
2. **Posicionamento**: Os ícones serão colocados ao lado do nome da empresa/representante (na div `.flex-1.min-w-0`), ou em uma `div` de ações (flex) alinhada à direita, antes dos botões de ação caso a cotação estivesse aberta. Como na seleção os botões não aparecem, os ícones podem ficar alinhados à direita com `margin-left: auto` e um estilo `text-muted-foreground` para não chamar muita atenção.
3. **Mapeamento de Dados**: No `useMemo` de `lista`, a propriedade `rep` já é encontrada: `const rep = (reps ?? []).find(r => r.empresaId === e.id)`. Vamos apenas passar o `rep` inteiro ou as props `email` e `whatsapp` para dentro do objeto que é retornado, para acessá-los no `filtrados.map`.

## Risks / Trade-offs

- **Espaço em telas menores**: Se a empresa tiver nome longo, os ícones podem ficar apertados. 
  - *Mitigação*: Utilizar `shrink-0` nos ícones e `truncate` no texto (já existe).
