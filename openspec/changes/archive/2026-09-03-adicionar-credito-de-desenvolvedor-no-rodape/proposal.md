## Why

Pedido do usuário: um crédito discreto de "desenvolvido por" em algum
lugar do sistema, sem atrapalhar o visual limpo do produto.

## What Changes

- Adicionar uma linha pequena e discreta de crédito em dois lugares de
  baixo tráfego visual: abaixo do link "Esqueci minha senha" na tela de
  login, e no rodapé da sidebar (abaixo do botão "Sair"), esse último
  seguindo o mesmo comportamento de recolher/expandir já existente (texto
  some quando a sidebar está no modo ícone, mesmo padrão do rótulo
  "Sair").
- Texto usado como placeholder: **"Desenvolvido por Francisco
  Montalvão"** — o usuário pode ajustar o texto exato (nome pessoal, nome
  de empresa, ou algo como "powered by") e se ele deve ser um link
  clicável (site/e-mail/WhatsApp) antes de rodar esta change; o texto e o
  link (se houver) ficam centralizados numa única constante para fácil
  edição num só lugar.

## Capabilities

### Modified Capabilities

- `shared/design-system`: requirement "Identidade de marca consistente" —
  adiciona um crédito de desenvolvedor discreto na tela de login e no
  rodapé da sidebar administrativa.

## Impact

- `src/admin/login/LoginPage.tsx`
- `src/admin/layout/AdminLayout.tsx`
