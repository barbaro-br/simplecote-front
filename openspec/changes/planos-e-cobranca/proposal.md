## Why

Para monetizar o SaaS, o sistema precisa saber se o `Comprador` está pagando e o que o plano dele permite. Hoje não há assinatura, plano, nem limite — todo `Comprador` tem acesso irrestrito e de graça. Falta: modelo de plano com limites, integração com um gateway de pagamento, o bloqueio de quem não está em dia, e os dados fiscais para emitir a NFS-e da mensalidade.

> **Quando**: é a **última fase** do roteiro de SaaS. Não bloqueia colocar os primeiros clientes no ar em modo de teste (basta `TESTE` sem prazo, ou prazo longo). Aplicar depois de cadastro, sessão, papéis e subdomínio estarem de pé.

## What Changes

- **Modelo de assinatura** no `Comprador` (back): `status_assinatura` (`TESTE`/`ATIVA`/`INADIMPLENTE`/`CANCELADA`), `plano`, `id_cliente_stripe` (ou equivalente), `trial_expira_em`.
- **Planos com limites**: cada plano define quotas — nº de cotações por mês, nº de usuários, nº de representantes, retenção de histórico — e features (ex.: análises avançadas, domínio próprio). O back rejeita a criação de recurso acima da quota com `ProblemDetail` (`403`/`422`).
- **Dados fiscais no momento da assinatura** (não no cadastro): ao converter de teste para pago, o front coleta os dados do tomador para a NFS-e — **CNPJ** (com preenchimento automático via lookup, reusando o padrão do cadastro de `empresas`), razão social, e-mail de faturamento e endereço completo (CEP via lookup, com `codigo_municipio_ibge`). Campos editáveis; bloqueia assinar se o CNPJ não estiver `ATIVA`. A **emissão da NFS-e** é do back (via middleware fiscal — NFE.io/Focus/PlugNotas/eNotas — ou emissão manual do contador no começo); o front só mostra a lista de notas emitidas com link do PDF.
- **Aba "Plano & cobrança"** em `admin/configuracoes`: mostra o plano atual, o uso vs. limite de cada quota, o estado da assinatura e o fim do teste; botões **"Assinar"** / **"Gerenciar cobrança"** que redirecionam para a sessão de checkout e para o portal do cliente do gateway (URLs vindas da API — o front não integra SDK de pagamento).
- **Bloqueio suave por inadimplência**: quando a assinatura está `INADIMPLENTE` ou `CANCELADA`, as chamadas a `/api/**` respondem `402`; o front intercepta e mostra uma tela de "pagamento pendente" com o botão de regularizar, **sem** mandar o usuário para `/login` e sem derrubar o app. Login, logout e a própria aba de cobrança continuam acessíveis.
- **Aviso de teste**: enquanto `TESTE`, um aviso persistente no painel mostra os dias restantes e leva para "Assinar".
- **Gating de features por plano**: recursos fora do plano aparecem desabilitados com um chamado para upgrade, em vez de sumirem sem explicação.

## Capabilities

### Added Capabilities

- `admin/cobranca`: assinatura e cobrança do `Comprador` — aba de plano e uso, checkout/portal via gateway, aviso de fim de teste, bloqueio suave por inadimplência (`402`) e gating de features por plano.

### Modified Capabilities

- `admin/configuracoes`: nova requirement "Aba de Plano e cobrança" dentro da tela de Configurações (não altera a edição de dados da loja).

## Impact

- Novo `src/admin/cobranca/`: `PlanoCobrancaPanel.tsx` (aba em `ConfiguracoesPage`), `AvisoAssinatura.tsx` (banner no `AdminLayout`), `PagamentoPendentePage.tsx` (tela do `402`), `DadosFaturamentoForm.tsx` (CNPJ + lookup + endereço, no fluxo de assinar), `NotasFiscaisList.tsx`, `cobranca.api.ts` (`GET /api/assinatura`; `POST /api/assinatura/checkout` e `.../portal` devolvendo URL; `GET/PUT /api/assinatura/dados-faturamento`; `GET /api/assinatura/notas`), `cobranca.schema.ts`, `usePlano.ts` (hook de gating).
- Reuso do lookup de CNPJ e de `src/shared/utils/cnpj.ts` já usados no cadastro de `empresas`; lookup de CEP para o endereço.
- `src/admin/configuracoes/ConfiguracoesPage.tsx`: adicionar a aba.
- `src/admin/layout/AdminLayout.tsx`: montar `AvisoAssinatura`.
- `src/shared/api/api-client.ts`: `402` em chamada autenticada → acionar handler de "pagamento pendente" (injetável, mesmo padrão do `sessaoExpiradaHandler`), sem limpar sessão nem redirecionar para `/login`.
- `src/App.tsx`: registrar o handler de `402` (navega para `/admin/pagamento-pendente` ou monta a tela como overlay).
- Telas com features "premium" (ex.: `admin/analise`) consultam `usePlano()` para desabilitar com aviso de upgrade.
- Testes: `PlanoCobrancaPanel` (uso vs. limite, botões chamam a API e redirecionam), `api-client` (`402` → handler, sem redirect para login), `PagamentoPendentePage` (mostra regularizar; login/logout acessíveis), `AvisoAssinatura` (dias restantes em `TESTE`), `usePlano` (feature fora do plano desabilita).
- **Contrato com o `simplecote-back`**: colunas/tabela de assinatura; tabela `dados_faturamento` 1:1 com `Comprador` (`cnpj`, `razao_social`, `nome_fantasia`, `inscricao_municipal?`, `email_faturamento`, endereço + `codigo_municipio_ibge`, `id_cliente_<gateway>`) e tabela `nota_fiscal`; webhook do gateway como fonte da verdade do `status_assinatura`; `GET /api/assinatura`, `POST /api/assinatura/checkout` e `.../portal`, `GET/PUT /api/assinatura/dados-faturamento`, `GET /api/assinatura/notas`; emissão de NFS-e via middleware fiscal (código de serviço LC 116 e alíquota de ISS conforme o contador); interceptor global que retorna `402` para `Comprador` inadimplente nas rotas `/api/**` (liberando auth e cobrança); enforcement de quota na criação de recursos.
