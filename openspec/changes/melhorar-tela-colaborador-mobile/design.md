## Context

`ColaboradorPage` (rota pública `/colaborador/:token`, mobile-first com `max-w-md`) hoje: (1) o cabeçalho (título da cotação + nome da loja) não é fixo — rola junto com a lista; (2) o formulário de cadastro de produto (nome/unidade/qtd-emb/quantidade) só aparece **após** um lookup de GTIN falhar (`gtinBipado` setado + `lookup.data === null`) — não há caminho para cadastrar sem bipar; (3) o feedback ao colaborador é um `toast.success` (já existe). Do lado do admin, a grade ao vivo usa SSE (`useGradeAoVivoSSE`) que hoje só trata o evento `LanceAtualizado`. Ver proposal.md (Why).

## Goals / Non-Goals

**Goals:**

- Colaborador: cabeçalho fixo, cadastro sem bipar, uso confortável em retrato no celular.
- Admin: ser notificado (toast) quando o colaborador adiciona item.

**Non-Goals:**

- Não muda apuração, resultado, PDF/XLSX nem contrato de lances.
- Não bloqueia/força orientação no navegador (web não controla orientação de forma confiável) — apenas **otimiza o layout para retrato**.

## Decisions

- **Cabeçalho fixo via `sticky top-0`** no bloco de cabeçalho, com fundo opaco (`bg-background`) para o conteúdo rolar por baixo sem vazar texto. Mesmo padrão já usado em `CotacaoDetalhePage` (`sticky top-0`). Sem lib nova.

- **Cadastro sem bipar reusa o endpoint de item bipado, com `gtin` opcional (back).** Alternativa considerada: criar `POST /{token}/produtos` separado — rejeitada por duplicar o fluxo; o back torna `gtin` nullable no `ColaboradorCadastrarItemBipadoRequest` e, quando nulo, cadastra o produto sem código de barras (change irmã no `simplecote-back`). No front, um botão "Cadastrar produto" (sempre visível, ao lado de "Bipar") abre o mesmo formulário de cadastro hoje restrito ao pós-bipagem, com `gtin` ausente.

- **Feedback colaborador:** manter `toast.success` e reaproveitar o mesmo estado de "pronto para o próximo item" (limpa seleção/busca). Sem mudança estrutural — só garantir que o cadastro sem bipar usa o mesmo caminho.

- **Feedback admin via SSE, não por diff de polling.** O back passa a emitir um evento novo (ex.: `ItemAdicionado`) no stream `/api/cotacoes/{id}/ao-vivo/stream` quando o colaborador adiciona um item (change irmã). No front, `useGradeAoVivoSSE` ganha um `addEventListener('ItemAdicionado', ...)` que dispara `toast.success`. Alternativa rejeitada: comparar a grade antes/depois do `invalidateQueries` para inferir item novo — frágil e não distingue colaborador de outros eventos.

## Risks / Trade-offs

- [Contrato do evento SSE divergir entre front e back] → nome do evento e payload precisam casar; usar a skill `contrato-drift` ao consumir o evento novo e alinhar na change irmã.
- [Cadastro sem bipar criar produto sem GTIN duplicando itens] → o back já deduplica produto existente por nome na adição de item (comportamento do `adicionarItem`); cadastro sem bipar deve seguir a mesma política.
- [Toast repetido se o evento chegar em rajada] → deduplicar/limitar no front (ex.: agrupar por janela curta) para não spammar o admin.

## Migration Plan

Sem migração de dados. Deploy: **back primeiro** (gtin opcional + evento SSE), depois front. Rollback normal.

## Open Questions

(nenhuma — abordagem confirmada com o usuário; o nome exato do evento SSE (`ItemAdicionado`) é decisão de implementação alinhável na change irmã.)
