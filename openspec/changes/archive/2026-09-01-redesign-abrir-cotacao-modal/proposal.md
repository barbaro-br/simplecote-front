# Redesign do Modal "Abrir Cotação"

## Problem
O modal atual de "Abrir Cotação" utiliza o input de data nativo do navegador, que não é esteticamente atraente, destoa do resto da interface e requer muitos cliques (abrir calendário, selecionar dia, digitar hora).

## Proposed Solution
Vamos implementar um modal "Abrir Cotação" nos moldes do **Design System 2026**. Faremos uso da estratégia de "Smart Presets" (Pílulas Inteligentes), que exibe botões rápidos ("Hoje às 18:00", "Amanhã às 12:00", etc.). Se o usuário quiser uma data customizada, ele acessa o input nativo, mas totalmente reestilizado para se encaixar na interface. Além disso, o modal ganhará um design "glassmorphic" (fundo translúcido).

## Capabilities
- **cotacoes/abrir-cotacao-modal**: Modificar a seleção de data e hora do modal para suportar "Smart Presets".
