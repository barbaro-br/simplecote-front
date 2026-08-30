## 1. InviteModal Component

- [x] 1.1 Create `src/admin/cotacoes/InviteModal.tsx` based on the Figma prototype, extracting the "Participantes" invitation logic from `ParticipantesSection.tsx`, and verify it renders correctly without errors.

## 2. Refactoring CotacaoDetalhePage

- [x] 2.1 Update `src/admin/cotacoes/CotacaoDetalhePage.tsx` to make the header sticky (using `sticky top-0 bg-background z-10 p-4 border-b`), and verify it sticks on scroll.
- [x] 2.2 In `src/admin/cotacoes/CotacaoDetalhePage.tsx`, add the "Representantes" button to the header and integrate it with the new `InviteModal`, passing the required props. Verify the modal opens and closes when clicked.

## 3. Enhancing ItensSection

- [x] 3.1 Update `src/admin/cotacoes/ItensSection.tsx` to display the packaging format properly (e.g., `Caixa (12x)` by combining `unidadeSnapshot` and `quantidadePorEmbalagemSnapshot`), and verify the display updates correctly.
- [x] 3.2 Update `src/admin/cotacoes/ItensSection.tsx` to replace the "Remover" text button with a Trash icon from Lucide, and verify it still functions to remove items.
- [x] 3.3 Update `src/admin/cotacoes/ItensSection.tsx` to include zebra striping (e.g., `even:bg-muted/30` or similar), and verify rows alternate colors.
- [x] 3.4 Update `src/admin/cotacoes/ItensSection.tsx` to use a numeric stepper for the "Qtd. Solicitada" column, connecting it to local state (or api if available), and verify the stepper increments and decrements correctly.

## 4. Enhancing ParticipantesSection

- [x] 4.1 Update `src/admin/cotacoes/ParticipantesSection.tsx` to remove the invitation form (which moved to the modal), keeping only the participant list, and verify it renders the list correctly.
- [x] 4.2 Update `src/admin/cotacoes/ParticipantesSection.tsx` to implement the new "Mais ações" menu (three dots) for actions like "Reenviar convite", "Copiar link", etc., as per the Figma prototype, and verify the actions work correctly.
