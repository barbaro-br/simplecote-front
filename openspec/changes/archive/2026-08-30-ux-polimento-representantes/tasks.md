## 1. Setup e Toasts

- [x] 1.1 Adicionar `sonner` às dependências no `package.json`, rodar npm install e verificar se a instalação ocorreu sem erros.
- [x] 1.2 Configurar o `<Toaster />` global no arquivo de layout raiz e testar com um toast simples para confirmar que o estilo se integra ao Tailwind v4.

## 2. Refinamento Visual de Componentes Base

- [x] 2.1 Atualizar `src/shared/components/ui/button.tsx` adicionando suporte a micro-interações (ex: `active:scale-[0.98] transition-all`) e verificar se os botões reagem adequadamente.
- [x] 2.2 Atualizar `src/shared/components/ui/dialog.tsx` para adicionar animações `fade-in`/`zoom-in` e overlay com `backdrop-blur-sm`, testando a abertura de qualquer modal na aplicação para confirmar o visual.

## 3. Cabeçalho Sticky na Cotação Detalhe

- [x] 3.1 Alterar o cabeçalho superior (título e ações) em `src/admin/cotacoes/CotacaoDetalhePage.tsx` para `sticky top-0 z-10`, e aplicar um fundo/sombra quando rolar.
- [x] 3.2 Remover os componentes antigos relacionados a `Participantes` que ficavam embaixo na página `CotacaoDetalhePage.tsx` (já removidos visualmente, garantir limpeza) e garantir que a página renderize e passe no `npm test`.

## 4. Modal de Representantes (UX Dividida)

- [x] 4.1 Modificar `src/admin/cotacoes/RepresentantesModal.tsx` para receber e reagir ao status da Cotação (Rascunho vs Aberta). Verificar renderização condicional.
- [x] 4.2 Implementar a visualização de Rascunho (apenas checkboxes sem abas extras) e garantir seleção e salvamento corretos.
- [x] 4.3 Implementar a visualização de Cotação Aberta focada nos Links Mágicos, substituindo as checkboxes por botões de `[Copiar Link]`, e integrando a função de copiar que dispara o `toast.success` configurado no passo 1.
- [x] 4.4 Garantir que todo o fluxo do Modal passe nos testes automatizados executando `npm test -- --run src/admin/cotacoes`.
