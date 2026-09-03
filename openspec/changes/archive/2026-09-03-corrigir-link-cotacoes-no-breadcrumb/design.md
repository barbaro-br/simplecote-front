## Context

`Breadcrumb` (`src/shared/components/ui/breadcrumb.tsx`) renderiza cada item conforme o `to` recebido — o componente em si está correto; o valor errado (`/admin` em vez de `/admin/cotacoes`) foi passado pelos dois locais que o usam. `NovaCotacaoPage.tsx` já usa `/admin/cotacoes` corretamente pro seu link "← Cancelar", confirmando qual é a rota certa.

## Goals / Non-Goals

**Goals:**
- Corrigir o destino do link, sem mudar mais nada do breadcrumb.

**Non-Goals:**
- Não investiga se havia outros links com o mesmo valor errado em outras telas fora do escopo desta sessão — só os dois pontos achados (`CotacaoDetalhePage.tsx`, `ResultadoPage.tsx`).

## Decisions

- **Correção pontual do valor, sem mudar a estrutura do `Breadcrumb`** — o bug é só no dado passado, não no componente.

## Risks / Trade-offs

- [Risco] Nenhum identificado — correção de uma string, sem efeito colateral.
