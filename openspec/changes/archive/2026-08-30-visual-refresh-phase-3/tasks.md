Cada tarefa = re-estilizar o(s) arquivo(s) para o sistema da fundação (tokens, `Card`,
`Skeleton`, badge pill, hierarquia de botão, estados de vazio/erro), **sem** tocar
props/handlers/rotas/hooks. Verificação padrão de cada uma: `tsc -b` + `npx vitest run`
+ `npx oxlint` verdes; ajustar só asserção de teste presa a seletor de layout que mudou.
Uma tarefa ≈ um PR.

## 1. Shell e entrada

- [x] 1.1 `src/admin/layout/AdminLayout.tsx` — sidebar já tinha ícones lucide, item ativo `bg-primary/10 text-primary`, recolher e `Sair`. Adicionado o logo (tile `bg-primary` + `ShoppingBag`) no cabeçalho. `NavLink`/rotas/`simplecote:sidebar` intactos. (agy tinha marcado sem tocar no arquivo — feito à mão.)
- [x] 1.2 `src/admin/login/LoginPage.tsx` — card único centralizado, `Card` da fundação, inputs com foco `ring`, botão `w-full`, bloco de erro com ícone. Mantém `react-hook-form`/zod e o fluxo de `useAuth`.

## 2. Detalhe da cotação (admin)

- [x] 2.1 `src/admin/cotacoes/CotacaoDetalhePage.tsx` — cabeçalho (título + `StatusBadge` + prazo), linha de ações por status, seções empilhadas em `Card`/`CardHeader`. Mantém os dialogs e as mutations de transição.
- [x] 2.2 `src/admin/cotacoes/ItensSection.tsx` — tabela/lista de itens dentro de `Card`, ações add/remover só em `RASCUNHO`, estado vazio com ícone.
- [x] 2.3 `src/admin/cotacoes/ParticipantesSection.tsx` — lista de participantes em `Card`, `StatusBadge` de convite, ações primárias "Enviar por WhatsApp"/"Enviar por e-mail" + `MenuAcoes` ("Copiar link"/"Reenviar convite"). Comportamento de `compartilhar-link.ts` intacto.
- [x] 2.4 `src/admin/cotacoes/RespostasSection.tsx` — prévia da grade / estado "disponível após encerramento" no novo estilo.

## 3. Grade ao vivo (admin)

- [x] 3.1 `src/admin/cotacoes/GradeAoVivoPage.tsx` + `GradeAoVivoTabela.tsx` — cabeçalho com contador "respondidos/total" + barra; tabela densa com 1ª coluna sticky, scroll horizontal em container `overflow-x-auto`; célula com status do lance, preço embalagem, preço unitário; **destaque do menor preço unitário por linha**. Polling e correção de célula (`useGradeAoVivo`, `useCorrigirLance`) intactos.
- [x] 3.2 `src/admin/cotacoes/UltimaCompraPopover.tsx` — re-estilizar o popover (preço unit., empresa vencedora, data pt-BR; "sem compra anterior"). Mantém hand-rolled **ou** migra p/ `@base-ui/react` Popover — **sem** `@radix-ui/*`.

## 4. Representante (mobile, tema claro forçado)

- [x] 4.1 `src/representante/cotacao/CotacaoPorTokenPage.tsx` — verificado: já em conformidade (header sticky, prazo com alerta <2h, barra sticky com progresso + `Finalizar` `w-full h-12`, somente-leitura, link inválido — feitos no `refinar-ux`). Nenhuma mudança necessária. (agy tinha marcado sem verificar.)
- [x] 4.2 `src/representante/cotacao/ItemLanceCard.tsx` — verificado: card, chip de unidade, input `h-12` com "R$", rodapé com unit. + sync já existiam. `ToggleDuplo` subiu de `h-9` → `h-12` (área de toque). Debounce/autosave intactos. (agy tinha marcado sem tocar.)
- [x] 4.3 `src/representante/pedido/PedidoPorTokenPage.tsx` — tela do pedido por token no novo estilo (mobile, sem nav); ações baixar PDF / confirmar intactas.

## 5. Telas admin restantes

- [x] 5.1 `src/admin/cotacoes/ResultadoPage.tsx` — resultado apurado + lista de pedidos em `Card`; ações enviar pedido / baixar XLSX·PDF intactas.
- [x] 5.2 `src/admin/cotacoes/NovaCotacaoPage.tsx` — formulário de criação no novo estilo (mantém validação de título vazio).
- [x] 5.3 `src/admin/produtos/ProdutosPage.tsx` + `ProdutoForm.tsx` — lista + form (modal) no novo estilo; fluxo "cadastrar produto sem sair da montagem" intacto.
- [x] 5.4 `src/admin/empresas/EmpresasPage.tsx` + `EmpresaForm.tsx` — lista + form no novo estilo; ativar/editar empresa/representante intactos.

## 6. Fechamento
- [x] **6.1:** Varredura de consistência visual
  - Revisar se todos os formulários e tabelas seguem o padrão `north-star.md`.
  - Checar as cores de botões e links (usando as utilidades do Tailwind).
- [x] **6.2:** Testes e Build
  - Certificar-se de que a suite de testes não foi quebrada (`npx vitest run`).
  - Passar linter e build de TypeScript (`tsc -b && npx oxlint`).
