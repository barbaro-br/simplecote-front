## Context

O frontend atualmente usa `@base-ui/react` e Tailwind CSS v4. A necessidade é melhorar a interação (UI/UX) da tela de Cotação Detalhe e o Modal de Representantes. Ver `proposal.md` para as motivações.

## Goals / Non-Goals

**Goals:**
- Implementar `sticky` header de forma robusta no container principal, lidando com overflow caso a lista de itens seja gigantesca.
- Separar visual e funcionalmente a interface do Modal de Representantes baseado no Status da Cotação (Rascunho = Seleção; Aberta = Gestão de Links).
- Centralizar micro-feedbacks em `sonner` (Toasts).
- Refinar os botões existentes (`scale` transition e `backdrop-blur`).

**Non-Goals:**
- Nenhuma alteração no backend ou schemas da API. 
- Sem mudança nas rotas da aplicação, tudo ocorre dentro de `CotacaoDetalhePage`.
- Não será implementado envio real de e-mails neste momento (foco em gerar link para copiar).

## Decisions

### 1. Sistema de Toasts (Sonner)
**Decisão**: Instalar e usar `sonner` para toasts.
**Rationale**: Simples, belo por padrão, e foca na experiência do usuário de forma moderna e não obstrutiva. Perfeito para avisar sobre "Link Copiado".
**Alternativas**: Radix UI Toast (exige muito boilerplace), ou Toaster nativo (muito básico).

### 2. Header Sticky
**Decisão**: Aplicar `sticky top-0 z-10 bg-background` no header da página de Detalhes.
**Rationale**: Mantém o botão de "Abrir Cotação" e informações principais sempre visíveis durante o preenchimento de planilhas gigantes.
**Alternativas**: Floating action bar no rodapé (complexo para o caso de uso atual).

### 3. Divisão de Contexto do Modal de Representantes
**Decisão**: Em vez de ter dois modais separados, teremos um único `<RepresentantesModal />` que muda a UI baseada no prop `status` da Cotação. Se `RASCUNHO`, renderiza a Lista de Seleção (checkboxes). Se `ABERTA`, renderiza a Lista de Links (sem checkboxes, mas com botões de copiar link individual para cada representante).
**Rationale**: Mantém a lógica de buscar os dados (`useEmpresas`, `useParticipantes`) centralizada no mesmo componente.

### 4. Micro-interações
**Decisão**: Estender os utilitários do Tailwind (ex: `active:scale-95 transition-all duration-200`) nos primitivos `Button`.

## Risks / Trade-offs

- **Risk**: Overflow e context stacking com `sticky`.
  - **Mitigation**: Certificar-se que o Z-index está corretamente configurado para não sobrepor Dropdowns ou Modais.
- **Risk**: Modal muito grande pode não caber em telas curtas.
  - **Mitigation**: Usar `max-h-[85vh]` e scroll interno no `<Dialog />`.
