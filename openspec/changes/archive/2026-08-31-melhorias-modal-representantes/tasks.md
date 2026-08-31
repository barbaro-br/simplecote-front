## Tasks

- [x] 1. Alterar `RepresentantesModal.tsx`:
  - Na função de envio de WhatsApp e na função de Copiar, substituir a interpolação manual `https://app.simplecote.com/responder/${id}` pela propriedade já fornecida pela API: `part.linkMagico`.
  - Implementar o `onClick` do ícone `Copy` usando `navigator.clipboard.writeText` e `toast.success`.
- [x] 2. Alterar `RepresentantesModal.tsx`:
  - Adicionar o ícone `Mail` (`lucide-react`) na mesma linha dos ícones de `Send` (WhatsApp) e `Copy`.
  - Vincular o clique do ícone de E-mail a uma função que chame a mutação `reenviarConvite` da API (importando `useReenviarConvite`).
  - Adicionar feedback de _loading_ visual (um spinner) ao ícone `Mail` da linha clicada e desabilitar o botão enquanto ocorre o envio.
