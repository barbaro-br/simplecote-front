## 1. Simplificar o diálogo

- [x] 1.1 `AbrirCotacaoDialog.tsx`: remover `presets`, `TipoPrazo`, `ViewMode`/duas etapas, `primeiroPresetValido`, `presetExpirado` e a grade de botões
- [x] 1.2 O diálogo abre direto com: `Calendar` (single) + selects de hora e minuto, data padrão = amanhã, hora padrão `18:00`
- [x] 1.3 Manter `calcularPrazoIso` só no caminho de data/hora escolhida, ancorado em `America/Sao_Paulo`; manter a checagem "prazo no futuro" antes de `onAbrir`
- [x] 1.4 Manter a **prévia** do prazo formatado (`dataHoraBr(prazoIso)`) acima do botão de confirmar, atualizando ao trocar data/hora
- [x] 1.5 A seleção de empresas (`empresasSelecionadas`) e o `onAbrir(prazoIso)` seguem iguais

## 2. Testes

- [x] 2.1 Reescrever `AbrirCotacaoDialog.test.tsx` (sem presets): data/hora padrão; trocar data ou hora atualiza a prévia; prazo no passado bloqueia com mensagem; confirmar chama `onAbrir` com o ISO esperado (`vi.setSystemTime`)
- [x] 2.2 Atualizar os testes de integração que clicavam nos presets removidos (`CotacaoDetalhePage.test.tsx` e `NovaCotacaoWizard.test.tsx`): trocar o clique por seleção de dia no calendário (`getByRole('gridcell', { name: '15' })`) + ajuste de hora pelos selects, com `vi.setSystemTime`/`toFake: ['Date']`
- [x] 2.3 `npm test` + `npm run build` + `npm run lint` verdes
