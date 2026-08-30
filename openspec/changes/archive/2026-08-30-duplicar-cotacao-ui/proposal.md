## Why

O backend já expõe `POST /api/cotacoes/{id}/duplicar` (retorna `{ cotacao, omitidos }`)
e o front já tem o hook `useDuplicarCotacao` em `cotacoes.api.ts` — mas **não há
nenhum ponto de entrada na UI**. O Comprador não consegue partir de uma cotação
anterior; toda cotação nova é montada do zero, mesmo quando a próxima semana repete
80% dos itens. A spec `admin/cotacoes` já menciona "duplicar" mas só num cenário
solto — falta o comportamento observável (onde a ação aparece, o que acontece com
itens que não puderam ser copiados, tratamento de erro).

## What Changes

- **Ação "Duplicar"** em dois lugares:
  - na **lista de cotações** (`CotacoesPage`), no menu de ações por linha;
  - no **detalhe da cotação** (`CotacaoDetalhePage`), junto das outras ações.
  Dispara `useDuplicarCotacao(id)`; no sucesso navega para o detalhe da nova cotação
  (nasce `RASCUNHO`).
- **Tratamento de `omitidos`**: quando o backend devolve itens que não deu pra copiar
  (produto inativado, etc.), a tela da nova cotação SHALL exibir um aviso
  **não-bloqueante** listando cada item omitido (nome + motivo). Sem `omitidos` →
  nenhum aviso.
- **Erro** (`ProblemDetail`): exibe a mensagem do backend no ponto de origem da ação,
  **sem navegar**.
- **Estados**: enquanto a mutation está pendente, o controle mostra "Duplicando…" e
  fica desabilitado.

## Capabilities

### New Capabilities
_Nenhuma._

### Modified Capabilities
- `admin/cotacoes`: o requisito **"Criar e duplicar Cotação"** ganha o comportamento
  de UI da duplicação — os pontos de entrada (lista + detalhe), o aviso não-bloqueante
  de itens omitidos, o tratamento de erro e o estado pendente. O cenário atual
  "Duplicar cotação anterior" continua válido e é detalhado.

## Impact

- **Código (front):** `src/admin/cotacoes/CotacoesPage.tsx` (menu de ação por linha —
  hoje só tem um `MoreHorizontal` sem menu), `src/admin/cotacoes/CotacaoDetalhePage.tsx`
  (linha de ações), e provavelmente um componente pequeno pro aviso de omitidos
  (reutilizável entre os dois destinos, ou lido de um `state` de navegação). O hook
  `useDuplicarCotacao` e os tipos `CotacaoDuplicada`/`ItemOmitido` **já existem** — sem
  mudança em `cotacoes.api.ts`/`cotacoes.schema.ts`.
- **API:** só consumo de `POST /api/cotacoes/{id}/duplicar`. Nenhum contrato novo.
- **Dependências:** nenhuma.
- **Testes:** MSW — sucesso sem omitidos (navega, sem aviso); sucesso com 2 omitidos
  (navega + aviso com os 2 nomes/motivos); `4xx` `ProblemDetail` (mensagem no lugar,
  não navega). Regressão de `CotacoesPage` e `CotacaoDetalhePage`.
- **Fora de escopo:** cancelar cotação (change própria); editar a cópia depois de
  duplicada (fluxo normal de rascunho); escolher **quais** itens copiar (o backend
  decide); duplicar a partir de qualquer estado que o backend recuse (o erro cobre).
