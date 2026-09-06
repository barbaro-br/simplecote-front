## 1. Simplificar o diálogo

- [ ] 1.1 `AbrirCotacaoDialog.tsx`: remover `presets`, `TipoPrazo`, `ViewMode`/duas etapas, `primeiroPresetValido`, `presetExpirado` e a grade de botões
- [ ] 1.2 O diálogo abre direto com: `Calendar` (single) + selects de hora e minuto, data padrão = amanhã, hora padrão `18:00`
- [ ] 1.3 Manter `calcularPrazoIso` só no caminho de data/hora escolhida, ancorado em `America/Sao_Paulo`; manter a checagem "prazo no futuro" antes de `onAbrir`
- [ ] 1.4 Manter a **prévia** do prazo formatado (`dataHoraBr(prazoIso)`) acima do botão de confirmar, atualizando ao trocar data/hora
- [ ] 1.5 A seleção de empresas (`empresasSelecionadas`) e o `onAbrir(prazoIso)` seguem iguais

## 2. Testes

- [ ] 2.1 Reescrever `AbrirCotacaoDialog.test.tsx` (sem presets): data/hora padrão; trocar data ou hora atualiza a prévia; prazo no passado bloqueia com mensagem; confirmar chama `onAbrir` com o ISO esperado (`vi.setSystemTime`)
- [ ] 2.2 `npm test` + `npm run build` + `npm run lint` verdes
