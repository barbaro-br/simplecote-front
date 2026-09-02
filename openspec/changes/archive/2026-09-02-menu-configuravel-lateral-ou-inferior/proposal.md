## Why

O usuário (dono da loja) quer poder escolher o estilo de navegação do painel: sidebar lateral (atual) ou barra inferior (padrão Instagram/Facebook). Confirmado com o solicitante: é para ser uma **escolha manual do lojista** salva em Configurações, não um comportamento automático por tamanho de tela.

Investigação de viabilidade (pedida explicitamente antes de decidir se "faz sentido"): ver `design.md` — é tecnicamente viável, mas com ressalvas importantes sobre quando esse padrão realmente funciona bem, documentadas como decisão de escopo abaixo.

## What Changes

- Novo campo "Estilo de navegação" nas Configurações da loja (`admin/configuracoes`): `Lateral` (atual) ou `Inferior`.
- Novo layout alternativo do shell administrativo: barra de navegação fixa na parte inferior da tela, com os itens mais usados visíveis e um botão "Mais" para os demais (ver `design.md` para o porquê de não caber os 7 itens direto na barra).
- `AdminLayout.tsx` passa a renderizar um dos dois estilos conforme a preferência configurada, mantendo os requirements já existentes de centralização de conteúdo (`admin/layout`) e permanência da navegação durante o scroll (`admin/layout`, adicionado em `fixar-sidebar-e-scroll-admin`) em ambos os estilos.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/configuracoes`: novo requirement — escolher o estilo de navegação (lateral ou inferior).
- `admin/layout`: novo requirement — o shell SHALL renderizar a navegação no estilo configurado, com equivalência de comportamento (centralização de conteúdo, navegação sempre visível durante scroll) entre os dois estilos.

## Impact

- `src/admin/layout/AdminLayout.tsx` — precisa suportar dois modos de renderização da navegação.
- Novo componente `src/admin/layout/BottomNavBar.tsx` (ou nome equivalente) para o estilo inferior.
- `AdminLayout.test.tsx` — cobertura dobra: os testes de shell precisam rodar para os dois estilos.
- **Depende de `configuracoes-da-loja-basico`** já estar aplicada (precisa do lugar de configuração e da API para guardar a preferência).
- **Depende de `fixar-sidebar-e-scroll-admin`** já estar aplicada (o estilo inferior também precisa de um `<main>` com scroll próprio, senão herda o mesmo bug de perder a navegação ao rolar).
- Recomendo aplicar **depois** também de `corrigir-responsividade-painel-admin` — mesmo arquivo (`AdminLayout.tsx`), evita conflito de edição, e essa change já resolve o bug de quebra em tela estreita independentemente do estilo escolhido aqui.
