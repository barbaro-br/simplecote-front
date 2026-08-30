## 1. Refining the Tutorial

- [x] 1.1 Update the final step's `desc` text in `src/representante/cotacao/TutorialOnboarding.tsx` to emphasize the need to finalize, and verify the text appears correctly in the browser.

## 2. Refining the ItemLanceCard

- [x] 2.1 Implement the unit abbreviation mapping (`Fardo -> fd`, etc.) in `src/representante/cotacao/ItemLanceCard.tsx`, and verify that units abbreviate correctly in the UI.
- [x] 2.2 Add conditional rendering in `src/representante/cotacao/ItemLanceCard.tsx` so that products with unit "Unidade" only render `un · comprar {qtd}` (omitting the redundant `com 1un`), and verify the display updates correctly.
