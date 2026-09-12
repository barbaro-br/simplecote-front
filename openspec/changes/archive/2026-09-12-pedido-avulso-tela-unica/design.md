## Context

`NovoPedidoAvulsoPage.tsx` já tem o cabeçalho único (condição de pagamento + prazo de entrega + total ao vivo), implementado antes desta change, com o combobox de condição de pagamento já aceitando criação inline (`Combobox` - `onCriarNova`, `simplecote-front/src/shared/components/ui/combobox.tsx`). Falta só acrescentar Empresa/Representante e travar o botão de confirmar o 1º item até os campos obrigatórios estarem prontos.

## Goals / Non-Goals

**Goals:**
- Empresa + condição de pagamento obrigatórias, com feedback claro de "o que falta" antes de deixar confirmar o 1º item.
- Representante nunca é uma escolha do lojista — só um texto derivado, reforçando a regra do back (front não decide, só exibe).

**Non-Goals:**
- Não muda a navegação de entrada na tela (já é direta).
- Não adiciona um segundo Representante por Empresa — enquanto o back não suportar isso, a tela também não precisa.

## Decisions

### Decisão 1: `useEmpresas()` + `useRepresentantes()` já existentes, sem endpoint novo

O combobox de Empresa usa `useEmpresas()` (já existe, `admin/empresas/empresas.api.ts`). Pra mostrar o nome do Representante, a tela busca em `useRepresentantes()` (já existe) o registro cujo `empresaId` bate com a Empresa escolhida — junção 100% no front, sem endpoint novo (o back só precisa, na criação, resolver e validar isso de novo por conta própria — é ele quem decide de verdade, a exibição aqui é só conveniência visual).

### Decisão 2: desabilitar o botão, não bloquear silenciosamente

Falta Empresa ou condição de pagamento → o botão "Adicionar item" (que é o que efetivamente cria o Pedido no primeiro clique) fica com `disabled` e um texto abaixo dizendo o que falta (ex.: "Escolha a Empresa e a condição de pagamento pra confirmar o primeiro item") — em vez de deixar clicar e devolver erro do backend, que seria pior UX pra algo checável antes de qualquer chamada de rede.

## Risks / Trade-offs

- **Empresa sem Representante cadastrado** só é descoberta ao tentar confirmar o 1º item (erro do backend) — o combobox de Empresa não filtra antecipadamente quais têm Representante, porque isso exigiria mais uma chamada/junção só pra essa checagem. Aceito: é um caso raro (a maioria das Empresas cadastradas já tem o Representante primário) e o erro do backend já explica o motivo.
