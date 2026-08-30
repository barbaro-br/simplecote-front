## 1. Helpers puros e tipos (base testável)

- [x] 1.1 Adicionar `whatsappRepresentante?: string | null` e `emailRepresentante?: string | null` ao tipo `ParticipanteDaCotacao` em `src/admin/cotacoes/cotacoes.schema.ts`; verificar que `npx tsc --noEmit` continua verde e que `useParticipantes` não precisou de mudança (passthrough).
- [x] 1.2 Criar `src/admin/cotacoes/compartilhar-link.ts` com `montarMensagemConvite({ representanteNome, titulo, empresaNome, prazo, link })`, `urlWhatsApp(msg, telefone?)` e `urlMailto(msg, assunto, email?)`; a mensagem segue `Olá {rep}, aqui está o link da cotação {titulo} da {empresa}. O prazo é até {prazo}. Acesse: {link}` e omite a frase do prazo quando `prazo` é nulo (usa `dataHoraBr`).
- [x] 1.3 Criar `src/admin/cotacoes/compartilhar-link.test.ts` cobrindo: mensagem com e sem prazo; `urlWhatsApp` com telefone (só dígitos no path) e sem telefone (`https://wa.me/?text=`); `urlMailto` com e sem destinatário; texto sempre `encodeURIComponent`. Verificar `npx vitest run compartilhar-link` verde.
- [x] 1.4 Criar helpers de tela do representante em `src/representante/cotacao/cotacao-token.derivados.ts` (ou arquivo equivalente): `prazoExpirando(prazo, agora?)` (true só se faltam <2h e >0) e `contarRespondidos(itens)` (`preco != null || statusLance === 'NAO_COTADO'`). Verificar com `cotacao-token.derivados.test.ts` (limites: 1h59, 2h01, prazo vencido, prazo nulo; contagem 0/N, 15/50, N/N).

## 2. Menu de ações reutilizável (sem dependência nova)

- [x] 2.1 Criar `src/shared/components/ui/menu-acoes.tsx`: gatilho `icon-button` (`MoreVertical`), lista `role="menu"` posicionada `absolute`, fecha em clique-fora (`pointerdown` no document), `Escape` e seleção de item. Aceita `items: { label, onSelect, disabled? }[]`.
- [x] 2.2 Criar `src/shared/components/ui/menu-acoes.test.tsx`: abre ao clicar no gatilho, chama `onSelect` e fecha ao escolher, fecha no `Escape` e no clique fora. Verificar `npx vitest run menu-acoes` verde.

## 3. Admin — ParticipantesSection: ações de compartilhamento

- [x] 3.1 Passar `titulo` e `prazo` da cotação para `<ParticipantesSection>` a partir do componente pai (detalhe da cotação); ajustar a assinatura de `Props` e as chamadas. Verificar `npx tsc --noEmit`.
- [x] 3.2 Em `ParticipantesSection.tsx`, na coluna "Ações" de cada participante, adicionar `icon-button`s primários "Enviar por WhatsApp" (`MessageCircle`) e "Enviar por e-mail" (`Mail`) que abrem `urlWhatsApp`/`urlMailto` (via `window.open` / `location.href` para `mailto`) com a mensagem de `montarMensagemConvite`, usando `whatsappRepresentante`/`emailRepresentante` quando presentes.
- [x] 3.3 Mover "Reenviar" e "Copiar link" para dentro de `<MenuAcoes>` como itens secundários; manter o retorno visual "Copiado!" por 2s. Remover os `Button`s ghost antigos dessas duas ações.
- [x] 3.4 Atualizar/expandir `ParticipantesSection` nos testes (`src/admin/cotacoes/*ParticipantesSection*.test.tsx` ou criar): monta URL `wa.me` correta (com e sem telefone), abre `mailto` com assunto/corpo, e "Copiar link" segue acessível pelo menu. Verificar `npx vitest run ParticipantesSection` verde.

## 4. Representante — CotacaoPorTokenPage: sticky top/bottom + progresso

- [x] 4.1 Compactar o `<header>` e torná-lo `sticky top-0 z-20` com `bg-background/95 backdrop-blur` e borda inferior; linha de Prazo recebe classe condicional de alerta (`text-destructive font-semibold`) quando `prazoExpirando(d.prazo)`, senão `text-muted-foreground`.
- [x] 4.2 Criar a barra `sticky bottom-0 z-20` (borda superior, `bg-background/95 backdrop-blur`) contendo: texto `Respondidos: {n}/{total}`, barra visual proporcional (`width: (n/total)*100%`), e o botão "Finalizar resposta" existente (mesmos estados: pendências da fila, `isPending`). Não renderizar a barra quando `somenteLeitura`.
- [x] 4.3 Ajustar o container da lista (`padding-bottom` ≥ altura da barra, `scroll-mt` nos cards) para nada ficar coberto pelos stickies; manter `max-w-md` centralizado. Deixar comentário apontando `TemaClaro` como container de rolagem.
- [x] 4.4 Atualizar `src/representante/cotacao/CotacaoPorTokenPage.test.tsx`: prazo <2h renderiza com a classe de alerta; prazo folgado não; "Respondidos: X/Y" reflete os itens do fixture; barra e botão presentes fora do modo leitura e ausentes no modo leitura. Verificar `npx vitest run CotacaoPorTokenPage` verde.

## 5. Representante — ItemLanceCard: hierarquia visual + toggle

- [x] 5.1 Dar destaque à unidade (pill `bg-muted rounded px-1.5 text-sm font-medium`) e ao campo de preço (prefixo "R$" à esquerda dentro do wrapper, `h-12`, `text-base`).
- [x] 5.2 Substituir o `<input type="checkbox">` "não cotado" por um segmentado de 2 opções ("Vou cotar" / "Não cotado") com `aria-pressed` e área de toque grande; ligar ao mesmo `setNaoCotado` sem mudar o efeito de autosave. Se o padrão se repetir, extrair `src/shared/components/ui/toggle-duplo.tsx`.
- [x] 5.3 Atualizar os testes de `ItemLanceCard` (`src/representante/cotacao/ItemLanceCard.test.tsx` ou criar): alternar para "Não cotado" desabilita o input e dispara `aoAssentar({ naoCotado: true })`; voltar para "Vou cotar" reabilita. Verificar `npx vitest run ItemLanceCard` verde.

## 6. Verificação final

- [x] 6.1 Rodar `npx vitest run` e `npx tsc --noEmit` — toda a suíte verde e sem erro de tipos.
- [x] 6.2 Rodar `npm run build` e conferir que compila.
- [x] 6.3 Verificação manual mobile (viewport ~375px, tema claro): abrir `/cotacao/:token` com fixture de >20 itens — cabeçalho e prazo fixos ao rolar, botão "Finalizar" + progresso sempre visíveis na base, card com toggle tocável; e no Admin, testar WhatsApp/e-mail/menu num participante.
- [x] 6.4 Rodar `openspec validate refinar-ux-compartilhamento-e-resposta-cotacao --strict` — sem erros.
