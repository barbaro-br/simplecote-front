## 1. Contrato e API (front)

- [x] 1.1 Adicionar `podeExcluir: boolean` ao tipo `Empresa` em `empresas.schema.ts` e conferir o nome do campo contra o `EmpresaDTO` do back (skill `contrato-drift`) — confirmar que não há divergência de nome que faria a flag sumir/fallback
- [x] 1.2 Adicionar `useExcluirEmpresa` em `empresas.api.ts` chamando `DELETE /api/empresas/{id}` com `invalidateQueries` da query de empresas — verificar que o endpoint responde 204 em sucesso
- [x] 1.3 Confirmar que o back (change irmã de mesmo nome em `simplecote-back`) expõe `DELETE /api/empresas/{id}` e o campo `podeExcluir`; registrar o status do deploy do back no handoff (front antes do back causaria 404/405)

## 2. UI — EmpresasPage

- [x] 2.1 Adicionar o ícone "Excluir" (lixeira) na coluna de ações, habilitado só quando `empresa.podeExcluir === true`; quando falso/ausente, desabilitado com tooltip "Não é possível excluir: a empresa já participou de uma cotação. Use Inativar."
- [x] 2.2 Ao clicar em "Excluir", abrir diálogo de confirmação nomeando a consequência (exclusão definitiva e irreversível) antes de disparar a mutação — verificar que cancelar não dispara o delete
- [x] 2.3 Tratar sucesso (toast + linha some após `invalidateQueries`) e erro de negócio 409 exibindo `ApiError.message` em pt-BR e mantendo a linha na listagem

## 3. Testes

- [x] 3.1 Teste da ação de excluir com MSW: sucesso remove a empresa da listagem; erro 409 mantém a linha e exibe a mensagem da API
- [x] 3.2 Teste do estado desabilitado: empresa com `podeExcluir: false` tem o botão desabilitado com a dica; com `true` o botão habilita e abre o diálogo de confirmação
- [x] 3.3 Teste da confirmação: sem confirmar o diálogo, o `DELETE` não é chamado; confirmando, é chamado uma única vez

## 4. Checagem de saúde

- [x] 4.1 `npm test` verde (Vitest + RTL)
- [x] 4.2 `npm run build` e `npm run lint` sem erro novo
