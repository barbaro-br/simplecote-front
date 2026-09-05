## 1. API

- [x] 1.1 Adicionar `useDesconvidarParticipante(cotacaoId)` em `cotacoes.api.ts` (`DELETE /api/participantes/{id}`, invalida a query de participantes ao concluir) — já implementado no working tree (hook presente em `cotacoes.api.ts`, invalida `participantes` e `aoVivo`); mantido como estava.

## 2. UI

> Layout atual do modal (após a mudança irmã de finalização): status badge + botões inline Finalizar/Reabrir sob o nome do representante; lista sem o filtro "só convidados" (todas as Empresas, convidadas primeiro). O círculo novo entra apenas no modo `status === 'ABERTA'` (não em todo `isAberta`).

- [x] 2.1 Renderizar o círculo de marcação (mesmo padrão visual do modo `RASCUNHO`, porém menor — `size-4` em vez de `size-5`) à esquerda do avatar quando `status === 'ABERTA'`, refletindo `!!e.part`: círculo vazio para Empresa não convidada, check para participante existente
- [x] 2.2 No modo `ABERTA`, o círculo é um `<button type="button">` real com `ev.stopPropagation()`; clique no círculo de Empresa não convidada chama `useConvidarEmpresas` com `[e.id]` (mesmo efeito do antigo botão "Convidar")
- [x] 2.3 Clique no círculo marcado de participante `CONVIDADO`/`VISUALIZOU` abre `ConfirmarDialog` (mesmo padrão de "Excluir Cotação" em `CotacoesPage.tsx`: título com o nome da Empresa — `Desconvidar {nome}?` —, descrição nomeando a consequência irreversível, `rotuloConfirmar="Desconvidar"`, `pendente`); confirmar chama `useDesconvidarParticipante(cotacaoId).mutateAsync(participanteId)`
- [x] 2.4 Círculo de participante `RESPONDIDO` aparece marcado (`CheckCircle2`) mas não é um `<button>` — não-interativo, clicar não dispara nada
- [x] 2.5 Botão "Convidar" (texto, na coluna de ações direita) preservado fora de `ABERTA` (`isAberta && !emAberta && !e.part`); removido apenas dentro de `ABERTA`, onde o círculo assume esse papel
- [x] 2.6 Erro do `DELETE` exibido via `toast.error` com `ApiError.message` quando disponível (filtrando `SessaoExpiradaError`), sem remover a linha da lista — o `invalidateQueries` só roda no sucesso
- [x] 2.7 `useDesconvidarParticipante` e `ConfirmarDialog` consumidos no modal (círculo de desconvidar + diálogo de confirmação)

## 3. Testes

> Escritos contra o layout atual (badge + botões inline sob o nome) e a semântica de "sai da lista de convidados": a Empresa continua listada (todas as Empresas aparecem), mas o círculo esvazia e o badge/botões de participante somem.

- [x] 3.1 Teste: em `ABERTA`, Empresa não convidada mostra círculo vazio (`title="Convidar"`); clicar chama a API de convidar e o círculo passa a marcado (`title="Desconvidar"`)
- [x] 3.2 Teste: círculo marcado para `CONVIDADO`; clicar + confirmar chama `DELETE /api/participantes/{id}` e a linha volta a mostrar o círculo de "Convidar"
- [x] 3.3 Teste: cancelar no diálogo ("Voltar") não chama a API — círculo permanece marcado
- [x] 3.4 Teste: círculo de `RESPONDIDO` não tem `title="Desconvidar"` nem `title="Convidar"` (não é botão), confirmando que não há interação possível
- [x] 3.5 Teste: erro 422 da API (`ApiError.message`) mantém o participante na lista (círculo ainda marcado) e mostra a mensagem específica do backend via toast
- [x] 3.6 Teste: em `RASCUNHO`, clicar na linha continua chamando `onToggle` (toggle de seleção) — sem regressão
- [x] 3.7 Teste: fora de `ABERTA` (`ENCERRADA`), o círculo novo não aparece e o botão "Convidar" (texto) permanece como estava
- [x] 3.8 `npx tsc -b`, `npx oxlint` e `npx vitest run` — 370/370 testes passando, sem regressões

## 4. Verificação end-to-end

- [x] 4.1 Com o back rodando localmente (mudança já arquivada no `simplecote-back`, endpoint `DELETE /api/participantes/{id}` confirmado ativo em `:8080`), testar ao vivo: convidar clicando no círculo em `ABERTA`, desconvidar um `CONVIDADO` e um `VISUALIZOU` (com e sem preço preenchido), confirmar que o círculo de um `RESPONDIDO` não é clicável. **Não realizado nesta sessão** — extensão Chrome não conectada neste ambiente em background. Recomenda-se checagem manual pelo usuário. **(verificado visualmente pelo dono do produto em 05/09/2026)**
