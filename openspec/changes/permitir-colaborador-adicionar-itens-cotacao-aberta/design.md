## Context

`ColaboradorPage.tsx` hoje busca `EstadoColaborador` (um objeto único, `cotacaoId`/`cotacaoTitulo` nulos = sem rascunho) e só oferece busca por texto em `GET .../produtos`. O back (`simplecote-back`) já muda o estado para Cotação `ABERTA` (mesclado) e vai mudar de novo (`permitir-colaborador-escolher-cotacao-aberta`, ainda não mesclado) para retornar uma **lista** de cotações abertas, exigindo `cotacaoId` explícito em `POST .../itens` e `POST .../produtos/bipado`. `@zxing/browser` já é dependência do projeto (ver `AdicionarItemModal`/bipagem admin, mesma lib).

## Goals / Non-Goals

**Goals:**
- Front pronto para 0, 1 ou N cotações abertas, mesmo N>1 sendo raro.
- Reaproveitar a UX de câmera de forma consistente com o que a mesma lib oferecerá no fluxo bipagem do admin (change irmã `adicionar-item-cotacao-via-bipagem`), sem duplicar padrão de leitura de código de barras.
- Testável sem câmera real (CI não tem webcam).

**Non-Goals:**
- Não constrói a tela de bipagem do admin (change separada, endpoint separado `/api/cotacoes/{id}/itens/bipar`).
- Não implementa histórico de itens bipados na sessão (fora do escopo desta change).
- Não resolve o back (as duas changes citadas são responsabilidade do `simplecote-back`).

## Decisions

- **Seletor de cotação como abas horizontais roláveis no topo, escondidas quando só há 1.** Alternativa considerada: dropdown/select. Rejeitada — com quase sempre 1 cotação, um `<select>` fica um clique extra desnecessário; abas mostram a opção sem esconder atrás de um menu, e com N tipicamente pequeno (2-3) não precisam de scroll na prática.
- **Câmera como tela cheia (overlay), não inline na página.** GetUserMedia + preview de vídeo precisa de área grande pra mirar o código; um modal/overlay full-screen com botão de fechar é o padrão mobile-first já usado no restante do projeto (`Dialog`).
- **Testar o zxing mockado, nunca a câmera real.** `@zxing/browser` expõe uma classe controladora (`BrowserMultiFormatReader`) que os testes devem mockar via `vi.mock`, disparando o callback de leitura com um GTIN fixo — replica o padrão que a change de bipagem do admin também deve seguir, para não duplicar abordagem de teste entre as duas telas.
- **`cotacaoId` como estado local da página (não persistido/URL), resetado para a mais recente a cada carregamento.** Alternativa considerada: guardar em query string. Rejeitada por simplicidade — é raríssimo ter N>1, e recarregar a página voltando pra "mais recente" é uma queda segura.

## Risks / Trade-offs

- [Front implantado antes do back `permitir-colaborador-escolher-cotacao-aberta` estar no ar] → o front espera uma lista; o back antigo ainda manda `cotacaoId`/`cotacaoTitulo` flat. **Mitigação**: não implantar este front em produção antes do back correspondente — mesmo risco já registrado no design do back.
- [Permissão de câmera negada em iOS Safari por política do navegador, não por escolha do usuário] → a tela precisa diferenciar "usuário negou" de "erro genérico" o mínimo possível, mas cai no mesmo fallback (busca por texto) nos dois casos — não é um risco que bloqueia a entrega, só poderia confundir o texto do aviso.

## Open Questions

- Se o lookup por GTIN encontrar um produto mas o nome vier em maiúsculas/formatação estranha do provedor externo, o colaborador edita antes de confirmar? Assumido que sim (o formulário pré-preenchido continua editável) — não muda a spec nem as tasks, só um detalhe de UI a confirmar durante a implementação.
