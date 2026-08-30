## Why

A nova UI de cotação do representante foi entregue, mas pequenos detalhes de UX precisam ser lapidados para ficar totalmente fiel ao protótipo e evitar ambiguidades. As embalagens estão sendo exibidas de forma longa e redundante (ex: "Fardo com 20un" ou "Unidade com 1un"), e o tutorial não enfatiza com força suficiente que clicar em "Finalizar" é obrigatório para enviar a resposta (se não, os lances ficam apenas como rascunhos e o backend os ignora na apuração).

## What Changes

- Mapeamento das nomenclaturas de embalagem do banco para siglas curtas (`Fardo` -> `fd`, `Caixa` -> `cx`, `Cartela` -> `crt`).
- Supressão do sufixo redundante "com 1un" para itens vendidos por "Unidade", exibindo apenas `un · comprar {Y}`.
- O texto do último passo do `TutorialOnboarding.tsx` será alterado para enfatizar a obrigatoriedade do botão "Finalizar" para enviar a resposta de forma definitiva.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `representante/cotacao`: O texto do tutorial será atualizado para refletir o caráter definitivo do botão Finalizar, e a formatação de embalagens no card será padronizada.

## Impact

- Modificações na camada de visualização em `ItemLanceCard.tsx`.
- Modificação na cópia textual em `TutorialOnboarding.tsx`.
