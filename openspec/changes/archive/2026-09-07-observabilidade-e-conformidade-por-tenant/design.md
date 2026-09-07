## Context

Ver `proposal.md` — Why. `src/shared/observability/sentry.ts` já inicializa condicionalmente por `VITE_SENTRY_DSN` e descarta `SessaoExpiradaError`. `baixarArquivo` no `api-client` já faz download autenticado (usado nos relatórios). O trabalho de LGPD por recurso (`lgpd-excluir-representante`) estabeleceu o padrão de confirmação forte para exclusão.

## Goals / Non-Goals

**Goals**
- Todo evento de erro logado sabe de qual `Comprador` veio, sem vazar dado pessoal.
- Cada `Comprador` consegue exportar seus dados e encerrar a conta pela própria UI.

**Non-Goals**
- Rate limiting, backup/restore por tenant, DPA — infra/jurídico, fora do front.
- Portabilidade em formato padronizado específico (ex.: schema da ANPD) — o back define o formato; o front baixa.
- Anonimização parcial / retenção seletiva — encerrar é tudo ou nada.

## Decisions

- **Tag de `Comprador` por id/slug técnico, nunca nome/e-mail/telefone.** A regra existente ("nenhum dado pessoal nos eventos") continua; o id do tenant é chave técnica, não PII. `setTag('comprador', id)` no login/boot, limpo no logout.
- **Fonte do id/slug: claim do JWT se disponível, senão `GET /api/configuracoes`.** Preferir o claim para não depender de uma chamada extra e para funcionar mesmo se `/api/configuracoes` falhar.
- **Exportar reusa `baixarArquivo`.** Mesmo mecanismo, mesma política de `401`; nada novo no `api-client`.
- **Encerrar = soft-delete no back + sessão encerrada no front.** O front não "apaga" nada localmente além da sessão; a purga é agendada no back. Confirmação forte (digitar o nome) segue o padrão de `lgpd-excluir-representante`.
- **Gating por papel** reusa `useAuth().role` da change `papeis-e-convites-da-organizacao`: exportar = `OWNER`/`ADMIN`, encerrar = `OWNER`.

## Risks / Trade-offs

- **Exportação pesada para `Comprador` grande** → o back pode responder assíncrono (gera e-mail com link) em vez de streaming; o front trata os dois: download direto OU "vamos te enviar por e-mail". Alinhar no pré-requisito.
- **Encerrar por engano** → confirmação forte + consequência nomeada; o soft-delete no back dá janela de recuperação por suporte.
- **Tag setada e sessão restaurada por refresh no boot** → garantir que o ponto de "boot com sessão" (change `sessao-longa-com-refresh-token`) também chama o setter da tag, não só o `login`.

## Migration Plan

1. Back: id/slug no claim, `GET /api/organizacao/exportacao`, `DELETE /api/organizacao`, tag nos logs do back.
2. Front: tag no `sentry.ts` (inócuo sem DSN) → cards de exportar/encerrar em Configurações.
3. Rollback: remover as chamadas de tag e os dois cards; nada mais depende deles.
