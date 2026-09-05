## Context

No modal de convite/participantes (`RepresentantesModal.tsx`), o componente exibia um ícone circular de check ao lado de um avatar colorido de 40px com as iniciais da empresa. Além da poluição visual, o botão de desconvidar era suprimido quando o participante atingia o status `RESPONDIDO`, impedindo o comprador de excluir um fornecedor que já havia preenchido e finalizado seus lances na cotação. O usuário forneceu um wireframe operacional detalhando o layout exato esperado para os cards.

## Goals / Non-Goals

**Goals:**
- Implementar fielmente o card de representantes desenhado no wireframe:
  - Checkbox direto `[ O ]` (ampliado para 20px / `size-5`), sem avatar circular com inicial.
  - Nome da empresa em caixa alta e destaque (`font-bold tracking-wide uppercase text-foreground`), com o nome do representante em linha separada logo abaixo.
  - Linha inferior com badge de status de 3 estados (`Pendente`, `Enviado`, `Finalizado`) acompanhado do botão explícito `[ Fechar cotação ]` (ou `[ Fechar c. ]`) para acionar a finalização da resposta pelo admin.
  - Coluna de ações rápidas à direita na ordem: E-mail (**E**), WhatsApp (**W**) e Copiar link (**C**).
- Permitir desmarcar o checkbox de qualquer participante em cotação aberta, inclusive com status `RESPONDIDO`.
- Exibir diálogo de confirmação claro antes de desconvidar: *"A empresa perderá o acesso e os preços já informados não terão validade nesta cotação."*
- Ao confirmar o desconvite, chamar `DELETE /api/participantes/:id` e remover o participante e seus lances.

**Non-Goals:**
- Alterações em outras telas do sistema ou na lógica do SSE da grade ao vivo (a grade já invalida a query ao receber atualizações de participantes).

## Decisions

### 1. Checkbox semântico e direto (sem avatar)
- **Decisão**: Remover totalmente o avatar circular (`obterCorPorNome`, `coresAvatar`) e usar um checkbox estilizado de 20px (`size-5`) com borda nítida.
- **Alternativa rejeitada**: Manter o avatar encolhido. Rejeitado porque o wireframe do usuário elimina explicitamente o avatar para dar espaço à identificação da empresa e ações de status.

### 2. Permissão de desconvidar participante `RESPONDIDO`
- **Decisão**: O clique no checkbox marcado de um participante `RESPONDIDO` abre o `ConfirmarDialog` de desconvidar. Ao confirmar, executa a mutação `useDesconvidarParticipante`.
- **Texto da confirmação**: Atualizado para enfatizar que os preços já colocados não terão validade nesta cotação.
- **Tratamento de Erro**: Mantém tratamento de erro via `ApiError` caso o backend rejeite a ação, exibindo a mensagem retornada.

### 3. Badge de Status em 3 estados
- **Decisão**: Mapear os estados do participante para 3 badges inequívocos:
  - `Finalizado` (`bg-success/15 text-success-foreground border-success/30`): quando `participanteStatus === 'RESPONDIDO'`.
  - `Enviado` (`bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50`): quando `conviteStatus === 'ENVIADO'` ou `participanteStatus === 'VISUALIZOU'` e ainda não finalizado.
  - `Pendente` (`bg-muted text-muted-foreground border-border/40`): quando convite ainda não foi enviado ou falhou.

### 4. Botão dedicado `[ Fechar cotação ]`
- **Decisão**: Em cotação `ABERTA`, renderizar um botão compacto com rótulo textual `Fechar cotação` (ou `Fechar c.`) ao lado do badge de status para participantes que ainda não estão `Finalizado`. Ao clicar, dispara `useFinalizarParticipante`, transitando o status para `Finalizado`.
- **Reabertura**: Quando o participante estiver `Finalizado` (e a cotação em `ABERTA` ou `ENCERRADA`), renderizar a ação de `Reabrir` para possibilitar correções caso o admin precise reabrir a resposta.

### 5. Coluna de Ações Rápidas (E, W, C)
- **Decisão**: Alinhar verticalmente à direita do card os 3 botões de ação:
  1. **E** (E-mail): Reenviar e-mail de convite (`useReenviarConvite`) com indicador de carregamento.
  2. **W** (WhatsApp): Abrir link do WhatsApp com mensagem formatada.
  3. **C** (Copiar link): Copiar link mágico para a área de transferência.

## Risks / Trade-offs

- **[Risco]** O backend em `ParticipanteService.java:210` possuía uma validação que lançava `RegraDeNegocioException("Não é possível desconvidar um representante que já finalizou a resposta.")`.
  - **Mitigação**: O mock de testes (MSW) do front é atualizado para refletir o novo comportamento (permitindo desconvidar participantes `RESPONDIDO`). No backend correspondente, a remoção dessa trava no `simplecote-back` já faz o cascade de exclusão dos lances via JPA (`orphanRemoval=true`), garantindo que os itens fiquem sem esses lances.
