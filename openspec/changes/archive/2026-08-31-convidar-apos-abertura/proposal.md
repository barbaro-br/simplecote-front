## Proposal: Convidar Representantes após Abertura da Cotação

**Contexto e Problema:**
Atualmente, se o comprador esquecer de convidar uma empresa, ele não tem como adicioná-la caso já tenha clicado em "Abrir Cotação".
O Front-end oculta a lista de empresas não-convidadas, e o Back-end trava a ação com o erro: *"Só é possível convidar empresas enquanto a cotação está em rascunho."*

**Por que remover um participante não é recomendado?**
Se a cotação já estiver aberta, o participante pode já ter inserido lances. Deletar esse participante quebraria o histórico de preços e a auditoria da cotação. Em vez de remover (deletar), o ideal no futuro seria poder "Bloquear/Anular Convite" para apenas impedir o acesso.

**Solução Proposta (Apenas Adição):**
1. **Back-end:** Alterar o `ParticipanteService` para permitir convidar se a cotação estiver `RASCUNHO` **ou** `ABERTA`.
2. **Back-end (Crucial):** Quando convidamos alguém com a cotação já `ABERTA`, o sistema precisa gerar automaticamente as linhas de lances (Grade de Lances) em branco para esse novo participante, senão a tabela ao vivo vai quebrar.
3. **Front-end:** Alterar o `RepresentantesModal.tsx` para exibir um botão "Adicionar Representante" ou mudar o modo de exibição, permitindo pesquisar empresas não convidadas e disparar o convite individual a qualquer momento.

**Escopo:**
- `simplecote-back`: `ParticipanteService.java`, injeção do gerador de lances.
- `simplecote-front`: `RepresentantesModal.tsx` (permitir visualizar e convidar não-selecionados na cotação aberta).
