## Why

O `AbrirCotacaoDialog` hoje oferece só 3 presets de prazo ("Hoje 18h / Amanhã 12h / Amanhã 18h") + calendário custom. Falta cobertura pra casos comuns ("daqui a 24h", "48h", "sexta 12h"), o cálculo usa `new Date()` do navegador sem fuso explícito, e o admin confirma sem ver o prazo resultante formatado — só o rótulo do preset.

## What Changes

- **Mais presets**, cobrindo o comum: `+24h`, `+48h`, `hoje 18h`, `amanhã 18h`, `sexta 12h` (o "sexta" some quando já é sexta/fim de semana). Presets vencidos continuam desabilitados.
- **Prévia do prazo**: acima do botão de confirmar, mostrar sempre o prazo resultante formatado em pt-BR / America/Sao_Paulo — ex.: "Expira sábado, 06/09 às 18:00 (horário de Brasília)" — usando `dataHoraBr` de `shared/format/formatters`.
- **Fuso explícito** no cálculo: o prazo é montado no fuso America/Sao_Paulo, não no do navegador (o admin e o servidor podem estar em fusos diferentes). Enviado à API em ISO-8601 UTC como hoje.
- Sem mudança de contrato — o `onAbrir(prazoIso)` continua igual.

## Capabilities

### Modified Capabilities

- `cotacoes/abrir-cotacao-modal`: o seletor de prazo ganha presets mais úteis, cálculo ancorado em America/Sao_Paulo e uma prévia do prazo resultante formatado antes da confirmação.

## Impact

- `src/admin/cotacoes/AbrirCotacaoDialog.tsx`:
  - `calcularPrazoIso` e `presetExpirado` passam a montar a data no fuso America/Sao_Paulo (via `date-fns-tz` **se já for dep** — verificar `package.json`; senão, offset fixo -03:00 documentado como limitação, ou `Intl` + `toZonedTime` manual). **Sem dependência nova sem aprovação** (`AGENTS.md`).
  - lista de presets ampliada (`+24h`, `+48h`, `sexta_12`), com o "sexta" condicional ao dia da semana atual.
  - bloco de prévia: `dataHoraBr(prazoIso)` renderizado sempre que há um prazo válido selecionado.
- Testes: `AbrirCotacaoDialog.test.tsx` — cada preset gera o ISO esperado (com relógio fixado via `vi.setSystemTime`); presets vencidos desabilitados; "sexta" ausente no fim de semana; a prévia mostra o prazo formatado e atualiza ao trocar de preset.
- Sem mudança no back.
