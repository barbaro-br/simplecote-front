## Why

O `AbrirCotacaoDialog` hoje abre numa grade de presets ("+24h", "amanhã 18h", "sexta 12h"…) e o calendário é uma segunda etapa ("Data Personalizada"). O usuário decidiu que prefere o oposto: **sem presets**, ao clicar em "Abrir" já cai no calendário + seletor de hora para escolher a data direto. Isso reverte a parte de presets da change `melhorar-selecao-de-prazo` — mas **mantém** dela a prévia do prazo formatado e o cálculo ancorado em `America/Sao_Paulo`.

## What Changes

- `AbrirCotacaoDialog` abre direto na visão de **calendário + hora** (o que hoje é a etapa "Data Personalizada"). Sem grade de presets, sem alternância de visões, sem `TipoPrazo`.
- Data pré-selecionada: **amanhã** (ou hoje se ainda der tempo até um horário padrão); hora padrão `18:00`.
- Mantém: a **prévia** do prazo formatado em pt-BR / São Paulo acima do botão de confirmar; o cálculo do ISO no fuso de São Paulo; a validação "prazo no futuro"; a seleção de empresas embutida (`empresasSelecionadas`) segue igual.
- `onAbrir(prazoIso)` — contrato inalterado.

## Capabilities

### Modified Capabilities

- `cotacoes/abrir-cotacao-modal`: o seletor de prazo deixa de ter presets e passa a abrir direto no calendário + hora, com uma data padrão sensata e a prévia do prazo resultante.

## Impact

- `src/admin/cotacoes/AbrirCotacaoDialog.tsx`: remover `presets`, `TipoPrazo`, `ViewMode`, `primeiroPresetValido`, `presetExpirado`, a grade de botões e a lógica de duas etapas. Manter `Calendar` + selects de hora/minuto + a prévia (`dataHoraBr`) + `calcularPrazoIso` (só o ramo custom, no fuso de São Paulo) + a checagem de futuro.
- `AbrirCotacaoDialog.test.tsx`: reescrever — não há mais presets; testa data padrão, troca de data/hora atualiza a prévia, prazo no passado bloqueia, confirmar chama `onAbrir` com o ISO certo (relógio fixado com `vi.setSystemTime`).
- A change `melhorar-selecao-de-prazo` já está arquivada; esta a substitui parcialmente (some a parte de presets do spec `abrir-cotacao-modal`).
- Sem dependência nova, sem mudança no back.
