## Context

O frontend renderiza um `<RepresentantesModal />` (em `CotacaoDetalhePage`) que lida com dois estados: `RASCUNHO` (seleção) e `ABERTA` (compartilhamento). Atualmente, no estado `ABERTA`, os botões de compartilhamento possuem texto completo ("WhatsApp", "Copiar Link") e existe uma barra de pesquisa.

## Goals / Non-Goals

**Goals:**
- Simplificar a UI do modal no estado `ABERTA` focando em ícones em vez de botões em texto.
- Inserir um botão de envio por E-mail individual e um global para envio em lote.
- Excluir totalmente a barra de busca de toda a UI do modal.

**Non-Goals:**
- Implementar a integração backend/Brevo para o envio de e-mails agora (faremos apenas mock/toast de sucesso no frontend).
- Alterar o design das checkboxes de seleção do estado `RASCUNHO`.

## Decisions

### 1. Botões de Compartilhamento em Ícone
**Decisão**: Garantir que existam os 3 botões na listagem `<Button size="icon" variant="ghost">` empilhados horizontalmente (WhatsApp, Email, Copiar) visíveis para compartilhar.
**Rationale**: Poupa espaço horizontal valioso, especialmente no mobile, e permite a inclusão da ação de e-mail sem quebrar a linha. Usar `lucide-react` para os ícones `Mail`, `Copy` (ou `Check` para copiado), e manter o logo do WhatsApp ou ícone de `Send`/`MessageCircle`.

### 2. Ação de Lote no Rodapé
**Decisão**: O botão "Disparar Todos por E-mail" ficará no `footer` do Modal apenas quando a cotação estiver `ABERTA`. Ao clicar, chamará `toast.success('Envio de e-mails em lote iniciado (Simulação)')`.
**Rationale**: Aproveita o espaço do rodapé (que hoje tem o botão "Fechar").

### 3. Remoção da Busca
**Decisão**: O `<input>` e o estado `busca` serão totalmente removidos do código.
**Rationale**: Como a lista de convidados é geralmente restrita a quem já foi selecionado, não é necessário manter uma busca poluindo o topo.

## Risks / Trade-offs
- **Acessibilidade**: Ícones sem texto podem ser confusos.
  - **Mitigation**: Adicionar `title` e `aria-label` adequados a todos os botões (`aria-label="Enviar por WhatsApp"`, etc).
