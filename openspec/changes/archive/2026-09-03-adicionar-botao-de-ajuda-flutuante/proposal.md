## Why

Pedido do usuário: um botão flutuante de ajuda (padrão comum — "?" no
canto inferior direito, como o widget de WhatsApp de muitos sites) que
abre um painel com um FAQ/tutorial em texto explicando os fluxos
principais do painel, pra reduzir a dependência de perguntar diretamente
sempre que surgir uma dúvida de uso.

## What Changes

- Adicionar um botão flutuante circular com ícone de interrogação, fixo no
  canto inferior direito de todas as rotas `/admin/**`, sempre visível
  independente do scroll.
- Ao clicar, abre o componente `Dialog` já usado em todo o painel admin
  (mesmo padrão visual dos demais modais), titulado "Ajuda", com uma
  lista de perguntas frequentes em formato acordeão (pergunta, clique
  expande a resposta em texto).
- Conteúdo inicial do FAQ (4 entradas, cobrindo os fluxos centrais):
  "Como criar uma nova cotação?", "Como convidar representantes?", "Como
  apurar uma cotação e gerar pedidos?", "Como cancelar uma cotação?" — cada
  uma com um passo a passo curto em texto, sem imagens/vídeo nesta
  primeira versão.
- Painel fecha ao clicar fora, no "X", ou em Escape.

## Capabilities

### Added Capabilities

- `admin/ajuda`: nova capability cobrindo o botão flutuante de ajuda e o
  painel de FAQ.

## Impact

- `src/admin/ajuda/BotaoAjudaFlutuante.tsx` (novo)
- `src/admin/ajuda/faq.ts` (novo, conteúdo das perguntas/respostas)
- `src/admin/layout/AdminLayout.tsx` (monta o botão em todas as rotas
  `/admin/**`)
