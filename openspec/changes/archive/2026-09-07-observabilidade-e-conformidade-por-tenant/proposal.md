## Why

Com muitos supermercados na mesma instância, dois buracos aparecem: (1) quando um erro de runtime é reportado, não dá para saber de qual `Comprador` veio, o que torna o suporte um chute; (2) a LGPD passa a valer por organização — cada `Comprador` precisa conseguir levar seus dados embora e encerrar a conta, não só excluir um representante aqui e ali (trabalho que já foi feito em `lgpd-excluir-representante`).

## What Changes

- **Contexto de inquilino no rastreamento de erros**: quando há sessão, os eventos enviados ao serviço externo (Sentry) levam uma tag com o identificador do `Comprador` (id/slug — **não** nome, não e-mail, não telefone). Sem sessão (rotas públicas por token) ou sem `VITE_SENTRY_DSN`, nada muda. Continua valendo a regra de **nenhum dado pessoal** nos eventos.
- **Exportar dados da organização** (aba de Configurações, só `OWNER`/`ADMIN`): botão que dispara `GET /api/organizacao/exportacao` e baixa um arquivo com os dados do `Comprador` (cotações, produtos, empresas, representantes, resultados) em formato portável. Reusa `baixarArquivo` do `api-client`.
- **Encerrar a organização** (aba de Configurações, só `OWNER`): ação de exclusão de conta com confirmação forte (digitar o nome do supermercado), que chama `DELETE /api/organizacao`. O backend faz soft-delete + purga agendada; o front, ao concluir, encerra a sessão e leva para uma tela de "conta encerrada". Nomeia a consequência (regra 8 do `AGENTS.md`).

## Capabilities

### Modified Capabilities

- `core/rastreamento-de-erros`: nova requirement adicionando a tag de `Comprador` aos eventos quando há sessão, sem afetar o gate por DSN nem a regra de não anexar dado pessoal.
- `admin/configuracoes`: novas requirements "Exportar dados da organização" e "Encerrar a organização" na tela de Configurações.

## Impact

- `src/shared/observability/sentry.ts`: ao iniciar/!renovar a sessão, `setTag('comprador', <id/slug>)`; limpar no logout. Fonte do id/slug: claim do JWT ou `GET /api/configuracoes`.
- `src/shared/auth/AuthContext.tsx`: pontos de login/logout/boot chamam o setter da tag.
- `src/admin/configuracoes/`: `ExportarDadosCard.tsx` e `EncerrarContaCard.tsx` numa aba/seção "Dados & privacidade" de `ConfiguracoesPage.tsx`; `configuracoes.api.ts` ganha `exportarDadosOrganizacao()` e `encerrarOrganizacao()`.
- Gating por papel (depende de `papeis-e-convites-da-organizacao`): exportar = `OWNER`/`ADMIN`; encerrar = `OWNER`.
- Testes: evento carrega a tag de `Comprador` com sessão e não carrega sem sessão; nenhum dado pessoal na tag; exportar chama a API e dispara o download; encerrar exige digitar o nome, chama `DELETE`, encerra a sessão.
- **Contrato com o `simplecote-back`**: id/slug do `Comprador` disponível (claim ou `/api/configuracoes`); `GET /api/organizacao/exportacao` (arquivo portável); `DELETE /api/organizacao` (soft-delete + purga agendada + invalidação de sessões); tag de `Comprador` também nos logs/eventos do back.
