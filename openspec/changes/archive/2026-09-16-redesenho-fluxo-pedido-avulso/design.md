## Context

Hoje o `NovoPedidoAvulsoPage` serve duas funções em uma tela: (a) coletar empresa/condição/prazo antes da criação do pedido e (b) exibir a grade de montagem de itens. O botão "Adicionar item" sem empresa selecionada dispara um toast de erro porque o POST de criação falharia. O visual diverge do padrão brutalista de `CotacoesPageV2`. O pedido ainda não existe quando a tela monta — só é criado no momento em que o usuário tenta adicionar o primeiro item.

## Goals / Non-Goals

**Goals:**
- Separar a pré-configuração (empresa + condição + prazo) em `ConfigurarPedidoModal`, aberto a partir da `PedidosPageV2`.
- Garantir que o usuário nunca chegue na tela de montagem sem um pedido já criado no back.
- Alinhar o visual de `NovoPedidoAvulsoPage` ao padrão brutalista (`rounded-none`, `#111813`, sem bordas de tabela, thead escuro).
- Enriquecer a tela de conclusão com PDF e reenvio de e-mail.

**Non-Goals:**
- Permitir alterar empresa ou condição de pagamento após o pedido criado (o back não tem endpoint para isso; o usuário foi informado e concordou em deixar para outra change).
- Redesenhar `AdicionarItemPedidoAvulsoModal` ou `EditarItemPedidoAvulsoModal` — ficam intactos.
- Adicionar dependências novas ao projeto.

## Decisions

### Decisão 1 — Modal pré-configuração NÃO navega; cria e navega internamente

**Alternativa A (escolhida):** o modal é renderizado na `PedidosPageV2`, faz o POST diretamente e navega para `/admin/pedidos-avulsos/{id}` após sucesso.

**Alternativa B:** criar rota `/admin/pedidos-avulsos/novo` como tela de configuração e a tela de montagem em rota separada. Descartada: quebraria o fluxo de F5-recovery (o id já está na URL quando o usuário chega na grade de itens).

**Alternativa C:** modal navega para `/admin/pedidos-avulsos/novo` e a tela de configuração vive em `NovoPedidoAvulsoPage`. Descartada: o usuário pediu explicitamente "uma tela só para os itens".

### Decisão 2 — `NovoPedidoAvulsoPage` passa a exigir `rotaId` definido

A rota `/admin/pedidos-avulsos/novo` (sem id) pode ser mantida como guardrail de fallback (redireciona para `/admin/pedidos`), pois o fluxo normal nunca chegará mais nela sem id — o modal cria o pedido e já navega com o id real. Assim, a lógica de "pedido não criado ainda" dentro de `NovoPedidoAvulsoPage` pode ser simplificada.

### Decisão 3 — Reutilizar `baixarPedidoPdf` de `cotacoes.api.ts`

A função já existe e cobre `GET /api/pedidos/{id}.pdf`. Não duplicar em `pedidos-avulsos.api.ts`.

### Decisão 4 — Validação de empresa obrigatória no modal com react-hook-form + zod

Schema local no modal: `{ empresaId: z.string().min(1, 'Selecione a empresa') }`. Condição de pagamento e prazo ficam opcionais (seguindo a API).

## Risks / Trade-offs

- [Risco] Usuário que abrir `/admin/pedidos-avulsos/novo` diretamente pela URL não verá mais o formulário de criação → **Mitigação**: redirecionar para `/admin/pedidos` com toast "Inicie o pedido pelo botão 'Novo pedido avulso'".
- [Trade-off] A tela de conclusão com PDF depende de `baixarPedidoPdf` de `cotacoes.api.ts` — acoplamento de pasta cruzado. Aceitável enquanto não houver um módulo compartilhado de pedidos.

## Open Questions

- O back futuramente adicionará endpoint para atualizar empresa/condição de um pedido ABERTO? Se sim, uma change adicional removerá a restrição de somente-leitura do cabeçalho. Deferido conscientemente.
