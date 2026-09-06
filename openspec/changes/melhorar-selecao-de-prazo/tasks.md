## 1. Fuso e cálculo

- [ ] 1.1 Verificar em `package.json` se há `date-fns-tz` (ou similar). Se sim, usar pra ancorar o cálculo em `America/Sao_Paulo`. Se não, **não** adicionar dependência: usar `Intl.DateTimeFormat` para obter o offset de São Paulo na data alvo e montar o ISO; documentar a abordagem no código
- [ ] 1.2 `calcularPrazoIso` e `presetExpirado` (`AbrirCotacaoDialog.tsx`): montar a data no fuso de São Paulo, não no do navegador; a saída continua ISO-8601 UTC

## 2. Presets

- [ ] 2.1 Ampliar a lista: `+24h`, `+48h`, `hoje 18h`, `amanhã 18h`, `sexta 12h`
- [ ] 2.2 O preset "sexta 12h" só aparece de segunda a quinta (some sexta/sábado/domingo)
- [ ] 2.3 Manter presets vencidos desabilitados (regra atual de `presetExpirado`)

## 3. Prévia do prazo

- [ ] 3.1 Acima do botão de confirmar, renderizar sempre `dataHoraBr(prazoIso)` do prazo selecionado — ex.: "Expira sábado, 06/09 às 18:00 (horário de Brasília)"
- [ ] 3.2 A prévia atualiza ao trocar de preset ou ajustar o custom

## 4. Testes

- [ ] 4.1 `AbrirCotacaoDialog.test.tsx` (com `vi.setSystemTime`): cada preset gera o ISO esperado
- [ ] 4.2 Presets vencidos desabilitados; "sexta 12h" ausente no fim de semana
- [ ] 4.3 A prévia mostra o prazo formatado e muda ao trocar de preset
- [ ] 4.4 `npm test` + `npm run build` + `npm run lint` verdes
