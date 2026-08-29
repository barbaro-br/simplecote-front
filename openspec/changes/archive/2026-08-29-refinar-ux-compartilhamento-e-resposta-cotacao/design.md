## Context

Ver `proposal.md — Why`. Estado atual relevante:

- **Admin** `src/admin/cotacoes/ParticipantesSection.tsx`: tabela de participantes; por linha há `Reenviar` e `Copiar link` (ambos `Button variant="ghost" size="sm"`). O tipo `ParticipanteDaCotacao` (em `cotacoes.schema.ts`) tem `representanteNome`, `empresaNome`, `linkMagico`, mas **não** telefone/e-mail. `useParticipantes` faz passthrough direto de `GET /api/cotacoes/{id}/participantes` (sem mapeamento), então campos extras que o backend enviar chegam intactos — só falta declará-los no tipo. O título e o prazo da cotação **não** estão nas props desta seção hoje.
- **Representante** `src/representante/cotacao/CotacaoPorTokenPage.tsx`: container `mx-auto max-w-md p-4 space-y-4`, `<header>` normal, lista de `ItemLanceCard`, e o botão "Finalizar resposta" ao fim do fluxo. A rota é embrulhada por `src/representante/TemaClaro.tsx` (`<div className="tema-claro min-h-screen ...">`), que é o container de rolagem efetivo (rola o body).
- **Representante** `src/representante/cotacao/ItemLanceCard.tsx`: card com nome + linha de metadados (`unidade · qtd · emb.`), um `Input` de preço e um `<input type="checkbox">` "não cotado". O autosave por item (debounce 800ms → fila → PUT) já existe e **não muda**.
- Kit de UI local mínimo: `button.tsx`, `input.tsx`, `dialog.tsx`, `icon-button.tsx`. **Não há Radix** no projeto (`lucide-react`, `cva`, `clsx`, `tailwind-merge` disponíveis). `dialog.tsx` é caseiro com portal.

## Goals / Non-Goals

**Goals:**
- Compartilhar o link com 1 toque por WhatsApp ou e-mail, com mensagem pronta, sem sair da tela de detalhe da cotação.
- Na tela do representante em mobile: prazo sempre à vista, botão de finalizar sempre alcançável, progresso visível, card de item mais tocável.
- Zero dependência nova de runtime.

**Non-Goals:**
- Nenhuma mudança no contrato da API, no backend, no fluxo de autosave/fila, ou nas regras de domínio (prazo, tri-estado, trava pós-finalização continuam do backend).
- Não construir um design system de `DropdownMenu`/`ToggleGroup` genérico e completo (Radix). Componentes mínimos, locais, só o necessário.
- Não persistir preferências novas em `localStorage` além da fila já existente.

## Decisions

### 1. Origem de telefone/e-mail do representante: campos opcionais no tipo, com fallback
`ParticipanteDaCotacao` ganha `whatsappRepresentante?: string | null` e `emailRepresentante?: string | null`. O front:
- WhatsApp: se houver telefone, `https://wa.me/{soDigitos(telefone)}?text={enc(msg)}`; senão `https://wa.me/?text={enc(msg)}`.
- E-mail: se houver e-mail, `mailto:{email}?subject={enc(assunto)}&body={enc(msg)}`; senão `mailto:?subject=...&body=...`.

Como `useParticipantes` já é passthrough, nenhum mapeamento novo é necessário — só o tipo. **Alternativa descartada:** bloquear a feature até o backend confirmar os campos → trava entrega de valor que já funciona (fallback sem destinatário é aceitável). **Alternativa descartada:** buscar o contato via `useEmpresas` cruzando `empresaId` → `useEmpresas` só devolve `{id, nome, ativo}`, não tem o contato.

### 2. Montagem da mensagem: helper puro testável
Novo `src/admin/cotacoes/compartilhar-link.ts` com:
- `montarMensagemConvite({ representanteNome, titulo, empresaNome, prazo, link }): string` — formato `Olá {rep}, aqui está o link da cotação {titulo} da {empresa}. O prazo é até {prazo}. Acesse: {link}`; omite a frase do prazo quando `prazo` é nulo; usa `dataHoraBr` de `@/shared/format/formatters` para formatar o prazo.
- `urlWhatsApp(msg, telefone?)` e `urlMailto(msg, assunto, email?)` — só concatenação + `encodeURIComponent`.

Testar o helper isola a lógica de URL do componente. `ParticipantesSection` recebe `titulo` e `prazo` da cotação por **novas props** (o pai `CotacaoDetalhe` já tem ambos).

### 3. "Copiar link" + "Reenviar" atrás de um menu caseiro (sem Radix)
Novo `src/shared/components/ui/menu-acoes.tsx`: botão gatilho (`icon-button` com ícone `MoreVertical` do lucide) + `<ul>` posicionado `absolute` logo abaixo, com `role="menu"`. Fecha em: clique fora (`pointerdown` no `document`), `Escape`, e ao escolher um item. Sem foco-trap completo (é um menu de 2 itens, não um dialog). WhatsApp e E-mail ficam **fora** do menu, como `icon-button`s diretos na coluna de ações (ícones `MessageCircle` e `Mail`).

**Alternativa descartada:** `<details>/<summary>` nativo — mais simples, mas o posicionamento e o "fecha ao clicar fora" ficam ruins dentro de célula de tabela. **Alternativa descartada:** adicionar `@radix-ui/react-dropdown-menu` — dependência nova para um caso pequeno; o projeto vem evitando Radix de propósito.

### 4. Sticky top/bottom no container que rola o body
O `TemaClaro` não tem `overflow`, então `position: sticky` resolve contra o viewport. Mudanças em `CotacaoPorTokenPage`:
- `<header>` vira `sticky top-0 z-20` com `bg-background/95 backdrop-blur` e borda inferior; conteúdo compactado (saudação + contexto numa linha, título, linha de prazo).
- Nova `<div>` de rodapé `sticky bottom-0 z-20` com `bg-background/95 backdrop-blur` e borda superior, contendo a barra de progresso + botão "Finalizar resposta" (o mesmo botão de hoje, só realocado). Some quando `somenteLeitura`.
- Os cards da lista ganham `scroll-mt`/padding para não ficarem atrás dos stickies; o container mantém `max-w-md` centralizado.

**Alternativa descartada:** `position: fixed` + spacers manuais → precisa medir altura dos elementos, quebra com quebra de linha do título em telas estreitas. Sticky é fluido.

### 5. "Prazo expirando (< 2h)" — cálculo derivado, sem timer
Helper `prazoExpirando(prazo: string | null, agora = new Date()): boolean` → `prazo != null && (prazo - agora) < 2h && (prazo - agora) > 0`. Calculado no render. **Sem `setInterval`**: a página já tem invalidação/refetch por foco do React Query e o representante interage o tempo todo; um cron de UI para virar a cor no minuto exato não vale a complexidade. Classe condicional `text-destructive font-semibold` na linha de prazo; caso contrário `text-muted-foreground`.

### 6. Progresso "respondidos/total"
Derivado das props que a página já tem: `respondidos = d.itens.filter(i => i.preco != null || i.statusLance === 'NAO_COTADO').length`, `total = d.itens.length`. Fonte de verdade = dados da API (não a fila local), então o número reflete o que o servidor confirmou. Barra visual = `<div>` com largura `${(respondidos/total)*100}%`. Texto `Respondidos: {respondidos}/{total}`.

### 7. Toggle "não cotado" no `ItemLanceCard`
Segmented control de 2 botões (`Vou cotar` | `Não cotado`) montado com dois `<button>` + `aria-pressed`, estilizados via `cva` (sem novo componente de kit se um segmentado local bastar; se repetir, extrair `src/shared/components/ui/toggle-duplo.tsx`). O estado `naoCotado` e o efeito de autosave **não mudam** — só troca o controle que dispara `setNaoCotado`. Campo de preço ganha prefixo "R$" (adorno à esquerda dentro do wrapper do input) e `h-12`; rótulo da unidade sobe para uma "pill" (`text-sm font-medium` em `bg-muted rounded px-1.5`).

## Risks / Trade-offs

- **[Backend nunca envia telefone/e-mail]** → fallback `wa.me/?text=` e `mailto:?...` já cobrem; o Comprador escolhe o contato. Documentado na spec como comportamento esperado.
- **[`mailto:` sem cliente de e-mail configurado]** → em desktop sem handler, o link não faz nada visível. Aceitável: WhatsApp é a ação primária; e-mail é alternativa. Não vamos detectar handler.
- **[Menu caseiro sem foco-trap / ARIA completo]** → menu de 2 itens, com `Escape` e clique-fora; risco de acessibilidade baixo. Se crescer, migrar para componente dedicado.
- **[Sticky quebra se algum ancestral ganhar `overflow` no futuro]** → teste de fumaça manual + comentário no código apontando `TemaClaro` como o container de rolagem.
- **[Barra inferior sticky cobre o último card em telas muito baixas]** → padding-bottom no container da lista igual à altura da barra; a barra é compacta (uma linha de progresso + botão `h-12`).
- **[Cor do prazo não vira exatamente no minuto do corte de 2h]** → atualiza no próximo render/refetch; diferença de alguns minutos é irrelevante para o alerta.

## Migration Plan

Mudança puramente de front, incremental, sem flag:
1. Helpers puros + tipos (`compartilhar-link.ts`, campos opcionais no schema, helpers de prazo/progresso) com testes.
2. `ParticipantesSection` (novas props `titulo`/`prazo` a partir do pai) + `MenuAcoes`.
3. `CotacaoPorTokenPage` sticky top/bottom + progresso.
4. `ItemLanceCard` hierarquia + toggle.

Rollback = reverter o PR; nenhum dado novo é persistido, nenhum contrato muda.
