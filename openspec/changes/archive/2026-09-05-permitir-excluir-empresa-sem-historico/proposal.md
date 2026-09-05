## Why

Hoje não existe como excluir uma Empresa — só inativar (`POST /api/empresas/{id}/inativar`). Uma empresa cadastrada por engano (nome errado, duplicada, teste) fica para sempre na listagem como "Inativa", sem saída. Falta uma exclusão de verdade — mas com segurança: empresa que já participou de alguma cotação tem histórico (Participante/lances) que a apuração, o resultado e a grade ao vivo referenciam, e esse histórico não pode sumir.

## What Changes

- **Front** — ação "Excluir" na tela de Empresas (`EmpresasPage`), via ícone de lixeira, com diálogo de confirmação nomeando a consequência (operação irreversível).
- **Front** — hook `useExcluirEmpresa` chamando `DELETE /api/empresas/{id}`.
- **Front** — o botão "Excluir" fica **desabilitado com dica (tooltip)** quando a empresa já participou de alguma cotação, guiado por uma flag vinda da API (`podeExcluir`); nesse caso "Inativar" continua sendo o único caminho.
- **Back (change irmã, outro repo)** — endpoint `DELETE /api/empresas/{id}` que só exclui de verdade quando a empresa tem **zero** registros em `Participante`; caso contrário retorna erro de negócio (409) com `ProblemDetail` em pt-BR, preservando o histórico intacto.
- Sem mudança no comportamento de inativar/ativar nem nos demais fluxos de Empresa.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `admin/empresas`: nova requirement de exclusão definitiva de Empresa (hard delete) restrita a empresas sem histórico de participação.

## Impact

- **Front (este repo):** `src/admin/empresas/EmpresasPage.tsx` (ação Excluir + tooltip de bloqueio + diálogo de confirmação), `src/admin/empresas/empresas.api.ts` (`useExcluirEmpresa`), `src/admin/empresas/empresas.schema.ts` (novo campo `podeExcluir` no tipo `Empresa`), e testes correspondentes.
- **Back (change irmã de mesmo nome em `simplecote-back`):** endpoint `DELETE /api/empresas/{id}` com validação de zero participações em `EmpresaController.java`, adição da flag `podeExcluir` no `EmpresaDTO`, e o respectivo erro de negócio 409 (`ProblemDetail`). A validação de regra de negócio vive no back — o front apenas consome a flag e o erro, nunca decide a regra (AGENTS.md §4).
- **Contrato de API:** novo endpoint `DELETE /api/empresas/{id}` (200/204 em sucesso, 409 quando há histórico) e novo campo `podeExcluir` no DTO de listagem de empresas.
- **Sem impacto** em Representante, Participante, apuração ou grade ao vivo — a exclusão é bloqueada sempre que existir qualquer participação.
