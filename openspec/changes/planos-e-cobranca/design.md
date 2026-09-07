## Context

Ver `proposal.md` — Why. O `api-client` já tem o padrão de handler injetável para um status especial (`sessaoExpiradaHandler` para o `401`). O `402` reusa esse padrão. Depende da change `sessao-longa-com-refresh-token` para o fluxo de `401` já estar assentado (evita conflito no `fetchWrapper`).

## Goals / Non-Goals

**Goals**
- O front nunca toca em dado de cartão; toda captura é no gateway.
- Estado da assinatura sempre lido do backend, nunca inferido de parâmetro de URL de retorno.
- Inadimplência restringe o uso sem quebrar o app nem expulsar para o login.

**Non-Goals**
- Escolher o gateway (decisão de negócio — ver Decisions).
- Billing por uso/metered, cupons, upgrade/downgrade com pró-rata na UI — o portal do cliente do gateway cobre; a UI só redireciona.
- Faturas/recibos renderizados no painel — link para o portal.

## Decisions

- **Gateway abstraído atrás da API.** O front só consome `GET /api/assinatura` e recebe URLs de `checkout`/`portal`. Trocar Stripe por Asaas/Iugu/Pagar.me não altera o front. Recomendação de negócio: **Stripe** se cartão em BRL basta (Checkout + Customer Portal prontos, webhook simples); **Asaas/Iugu** se precisar boleto/PIX nativo, comum em PME de supermercado. A decisão precisa sair antes de o back começar — muda o formato do webhook e do modelo de assinatura.
- **Webhook é a fonte da verdade.** O `status_assinatura` só muda por webhook do gateway. A URL de retorno do checkout não carrega estado confiável; o front apenas re-busca `GET /api/assinatura` ao voltar.
- **`402 Payment Required` para inadimplência, não `403`.** `403` já significa "sem permissão" no app; `402` é inequívoco e o interceptor global do back consegue distinguir. O front trata `402` com um handler dedicado (overlay/rota `pagamento-pendente`), análogo ao `sessaoExpiradaHandler`.
- **Enforcement de quota no backend, espelho no front.** O back é a autoridade (rejeita com `ProblemDetail`). O front lê os limites de `GET /api/assinatura` só para desabilitar cedo e explicar — nunca como única barreira (regra do `AGENTS.md`: o front não decide regra de negócio).
- **Aviso de teste e bloqueio vivem em `admin/cobranca`, não em `admin/layout`.** São estado de assinatura renderizado no shell; manter a regra numa capability só evita espalhar.

## Risks / Trade-offs

- **Conflito no `fetchWrapper` com a change de refresh token** → ordenar: `sessao-longa-com-refresh-token` primeiro; aqui só adicionar o ramo `402` (que não tenta refresh).
- **Loop de bloqueio**: a tela de pagamento pendente não pode fazer chamadas `/api/**` que também deem `402` → ela só chama `GET /api/assinatura` e os endpoints de checkout/portal, que o back libera mesmo para inadimplente.
- **Webhook atrasado** deixa o dono "pago mas bloqueado" por alguns segundos → a tela de pagamento pendente tem um "já paguei, atualizar" que re-busca o estado.
- **Relógio para "dias restantes de teste"** → usar `trial_expira_em` do back e formatar; não calcular a partir do relógio local isoladamente.

## Migration Plan

1. Back: colunas de assinatura, `GET /api/assinatura` (todo `Comprador` existente entra como `ATIVA` ou `TESTE` estendido — decisão de negócio para não bloquear o cliente atual), webhook, interceptor `402`, enforcement de quota.
2. Front: aba de cobrança + `usePlano` (read-only, inócuo) → depois o ramo `402` no `api-client` → depois o gating de features.
3. Rollback: remover o handler de `402` do front volta ao comportamento atual; a aba de cobrança fica visível mas inofensiva.

## Open Questions

- Os `Comprador` já existentes entram em qual estado e com qual plano? (decisão de negócio, não muda specs nem tasks do front)
- Período de graça entre falha de pagamento e `INADIMPLENTE`: definido no gateway/back, o front só reage ao `402`.
