## Why

Complementa a change de mesmo nome no `simplecote-back`, que adiciona `DELETE /api/representantes/{id}` (remove a linha quando sem histórico; anonimiza a PII quando com histórico). No front, hoje o catálogo de fornecedores só oferece **inativar** o representante — não há caminho para apagar/anonimizar os dados pessoais da pessoa (LGPD, direito ao esquecimento).

## What Changes

- No catálogo de fornecedores (Empresas), cada Empresa com Representante ganha uma ação **"Excluir contato"**, sempre atrás de um diálogo de confirmação que nomeia as duas possibilidades:
  - se o representante nunca participou de cotação → **os dados são apagados** e a empresa fica sem contato (não pode ser convidada até cadastrar outro);
  - se já participou → **os dados pessoais são anonimizados** (nome/e-mail/WhatsApp), o histórico de cotações é preservado.
- Ao confirmar, chama `DELETE /api/representantes/{id}` e mostra um toast conforme o `resultado` da API (`REMOVIDO` ou `ANONIMIZADO`).
- Erro da API exibido a partir de `ApiError.message` (`AGENTS.md §5`).

## Capabilities

### Modified Capabilities

- `admin/empresas`: o catálogo de fornecedores passa a permitir excluir o Representante (contato) de uma Empresa, com o front explicando no diálogo os dois desfechos (apagar vs. anonimizar) que o back decide.

## Impact

- `src/admin/representantes/representantes.api.ts`: novo hook `useExcluirRepresentante` — `api.delete<{ resultado: 'REMOVIDO' | 'ANONIMIZADO' }>('/api/representantes/${id}')`, invalidando `['empresas']` no sucesso.
- `src/admin/empresas/EmpresasPage.tsx` (ou o componente de linha da Empresa): ação "Excluir contato" quando a Empresa tem Representante → abre `ConfirmarDialog` com o texto dos dois desfechos → chama o hook → toast por `resultado`.
- `representantes.schema.ts`: tipo do retorno (`ResultadoExclusaoRepresentante`).
- Testes: `empresas.test.tsx` / `representantes.api.test.tsx` — a ação aparece só quando há Representante; confirmar chama `DELETE .../representantes/{id}`; cancelar não chama; toast reflete `REMOVIDO` vs `ANONIMIZADO`; estado otimista + rollback em erro (`AGENTS.md §4`).
- Sem dependência nova. Depende da change do `simplecote-back` estar mesclada.
