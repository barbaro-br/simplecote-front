## Technical Design

- **Arquivo principal:** `src/admin/cotacoes/RepresentantesModal.tsx`
- **Ação de Cópia (Copy):**
  - O botão de "Copy" (`Copy` icon do `lucide-react`) precisa ter um `onClick`.
  - Usaremos `navigator.clipboard.writeText(link)` e exibiremos um `toast.success("Link copiado com sucesso!")`.
- **Ação de E-mail Individual:**
  - Inserir um botão com ícone `Mail` da `lucide-react`.
  - Criar função que consome um novo ou adaptado `useMutation` (pode ser o mesmo hook `useReenviarConvite` que já foi feito, mas acionando um a um).
  - Como o modal já usa um array de participantes (`const convitesPendentes = participantes.filter(...)`), e renderiza uma lista `participantes.map(...)`, cada item deve ter seu próprio estado de `isPending` se for reenviar individualmente. Para simplificar e evitar estado complexo dentro do map, podemos extrair a renderização do item para um sub-componente `<RepresentanteItem />`, ou gerenciar o _loading_ setando o ID que está carregando `setLoadingId(participante.id)`.
