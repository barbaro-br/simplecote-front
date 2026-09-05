## Context

`EmpresasPage` lista empresas (`GET /api/empresas?incluirInativos=true`) com ações por linha: Editar, e Inativar/Ativar (`POST /api/empresas/{id}/inativar|ativar`) — mesmo padrão de Produtos. O tipo `Empresa` no front hoje é `{ id, nome, ativo }`. Não existe `DELETE` de empresa em lugar nenhum (nem front nem back), e o back (`EmpresaController`) não expõe se uma empresa tem participação em cotação. Ver proposal.md para a motivação.

Regra dura do projeto (AGENTS.md §4): o front **nunca decide regra de negócio** — valor derivado vem pronto da API. Logo a decisão "essa empresa pode ser excluída?" é do back, entregue como flag no DTO; o front só a consome para habilitar/desabilitar a UI e exibe o erro de negócio via `ApiError.message`.

## Goals / Non-Goals

**Goals:**

- Excluir de verdade uma empresa **sem histórico** (zero registros em `Participante`).
- Bloquear a exclusão (com UX clara) quando há histórico, mantendo "Inativar" como único caminho.
- Manter o contrato front/back explícito e à prova de drift (flag e status HTTP definidos).

**Non-Goals:**

- **Sem soft-delete** (flag lógica + filtros em toda consulta). Não há motivo de negócio para apagar uma empresa que já participou; inativar já cobre esse caso. Mudança muito maior e desnecessária.
- Sem mexer em Representante/Participante/apuração — a exclusão é bloqueada sempre que existir participação.
- Sem alterar os fluxos de inativar/ativar existentes.

## Decisions

- **Hard delete restrito a zero participações.** O back valida: só exclui (`DELETE /api/empresas/{id}`) quando a empresa não tem registros em `Participante`; caso contrário retorna erro de negócio **409** com `ProblemDetail` em pt-BR. Alternativa considerada: soft-delete — rejeitada (ver Non-Goals).

- **Flag `podeExcluir` no DTO de listagem.** O back adiciona `podeExcluir: boolean` (derivado de "zero participações") ao `EmpresaDTO`; o front adiciona o campo ao tipo `Empresa` (`empresas.schema.ts`) e o usa para desabilitar o botão. Alternativa: o front calcular por conta própria — rejeitada por violar a regra §4 e por não ter dados de participação disponíveis. Nome `podeExcluir` segue o padrão já usado no projeto para valores derivados de permissão (`podeEditar`).

- **Botão desabilitado com tooltip (não oculto).** Para `podeExcluir === false`, o ícone "Excluir" fica desabilitado com dica "Não é possível excluir: a empresa já participou de uma cotação. Use Inativar.". Alternativa: ocultar o botão — rejeitada por remover a descoberta da ação e do porquê do bloqueio.

- **Confirmação nomeando a consequência (regra 8 do AGENTS.md).** Operação irreversível → diálogo de confirmação (reaproveitando o padrão `ConfirmarDialog` já usado no projeto) que nomeia que a exclusão é definitiva e não pode ser desfeita. Sem confirmação, sem delete.

- **Defesa em profundidade (front desabilita, back sempre valida).** Mesmo com o botão desabilitado, o back valida a regra de novo — cobre a corrida em que a empresa ganha participação em outra sessão após a listagem carregar. O front trata o 409 exibindo `ApiError.message` e mantém a linha.

- **Endereçamento cross-repo.** A implementação real da regra e do endpoint vive no back (`simplecote-back`, change irmã de mesmo nome). O front só consome. Ver Migration Plan para a ordem de deploy.

## Risks / Trade-offs

- [Drift de nome de campo `podeExcluir`] → mesmo risco já visto com `insightProdutoSchema` vs `InsightProdutoDTO`: nome divergente faz o dado cair em fallback silenciosamente (botão sempre desabilitado ou sempre habilitado). Mitigação: checar `empresas.schema.ts` contra `EmpresaDTO` do back via skill `contrato-drift` durante a implementação.
- [Front no ar antes do back] → `DELETE /api/empresas/{id}` retornaria 404/405. Mitigação: ordenar o deploy (back antes do front) e alinhar na change irmã.
- [Corrida: empresa ganha participação após o load] → 409 na confirmação. Mitigação: tratar o erro e invalidar a query de empresas; UX não quebra, só informa.
- [Flag ausente em versões antigas do DTO] → campo `podeExcluir` indefinido faria o botão ficar desabilitado por segurança. Mitigação: a UI habilita a exclusão apenas quando `podeExcluir === true` (qualquer ausência/indefinido é tratado como bloqueado — falha fechada).

## Migration Plan

Sem migração de dados — mudança de endpoint + campo de DTO. Ordem de deploy: **back primeiro** (novo endpoint `DELETE` + campo `podeExcluir` no DTO), depois o front (botão + hook). Rollback normal (`vercel rollback` no front; redeploy do back), sem estado para reverter.

## Open Questions

(nenhuma — a decisão de hard-delete-condicional e a superfície de bloqueio já foram confirmadas com o usuário e registradas na spec.)
