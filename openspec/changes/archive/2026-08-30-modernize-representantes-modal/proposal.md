## Why

O layout atual do modal de convite de representantes é simples, mas pode ser aprimorado para fornecer uma experiência de usuário (UX) mais rica. Um novo design (baseado em um protótipo do Figma) propõe adicionar funcionalidades de busca, filtros rápidos por status de envio e um rodapé contextualizado que exibe mensagens e ações de acordo com o estado da cotação. Isso trará mais eficiência para o usuário ao selecionar e acompanhar os convites.

## What Changes

- **Layout e Estilização**: Adaptação do design proposto no Figma para o componente `RepresentantesModal.tsx` usando Tailwind CSS e ícones do `lucide-react`.
- **Busca**: Inclusão de um campo de busca por nome da empresa ou representante.
- **Filtros**: Inclusão de chips ("Todos", "Enviado", "Não enviado") com contadores para filtrar a lista. (Exibidos apenas quando a cotação não for Rascunho).
- **Rodapé Inteligente**: Substituição dos botões genéricos por ações e avisos condicionados ao status da cotação (ex: Aviso de disparo no "Rascunho" e botão condicional "Enviar para todos" com contador de pendentes).
- **Estado Individual**: Exibição da badge de status de envio na listagem (apenas se cotação estiver aberta).
- **Adequação à API Real**: Integração do novo layout aos dados reais dos hooks `useEmpresas` e `useParticipantes`, substituindo os mocks do protótipo e omitindo o campo fictício "cidade".

## Capabilities

### New Capabilities
- `cotacoes/representantes-modal-advanced`: Busca, filtros rápidos e rodapé contextualizado no modal de seleção de representantes.

### Modified Capabilities

## Impact

- **Componente**: `src/admin/cotacoes/RepresentantesModal.tsx` será fortemente refatorado, mas mantendo a mesma assinatura de propriedades e usando os dados providos pelos hooks já existentes.
- **Participantes**: O hook `useParticipantes` (e `Participante`) já possui o controle de `inviteStatus`, bastando cruzar os dados na interface para exibir "enviado" / "não enviado".
