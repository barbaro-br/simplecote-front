## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Decisão de negócio: gateway (Stripe vs. Asaas/Iugu/Pagar.me) e planos + limites
- [ ] 0.2 Modelo de assinatura no `Comprador` (`status_assinatura`, `plano`, `id_cliente_stripe`, `trial_expira_em`) + estado dos `Comprador` existentes
- [ ] 0.3 `GET /api/assinatura` (plano, status, fim de teste, uso vs. limite por quota)
- [ ] 0.4 `POST /api/assinatura/checkout` e `POST /api/assinatura/portal` → devolvem URL
- [ ] 0.5 Webhook do gateway como fonte da verdade do `status_assinatura`
- [ ] 0.6 Interceptor global: `402` para `Comprador` inadimplente em `/api/**` (libera auth, `GET /api/assinatura`, checkout/portal)
- [ ] 0.7 Enforcement de quota na criação de recursos, com `ProblemDetail` pt-BR
- [ ] 0.8 Tabela `dados_faturamento` (1:1 com `Comprador`) + `nota_fiscal`; `GET/PUT /api/assinatura/dados-faturamento`, `GET /api/assinatura/notas`
- [ ] 0.9 Emissão de NFS-e via middleware fiscal (ou processo manual do contador no início); definição com o contador do código de serviço LC 116 e da alíquota de ISS

## 1. API client e hook de plano

- [ ] 1.1 `src/admin/cobranca/cobranca.schema.ts` + `cobranca.api.ts`: `useAssinatura()`, `useIniciarCheckout()`, `useAbrirPortal()`
- [ ] 1.2 `src/admin/cobranca/usePlano.ts`: expõe plano, limites e helper `podeUsar(feature)`

## 2. Ramo 402 no api-client

- [ ] 2.1 `api-client.ts`: handler injetável `pagamentoPendenteHandler` (padrão do `sessaoExpiradaHandler`); `402` autenticado → aciona o handler, sem limpar sessão nem redirecionar para `/login`
- [ ] 2.2 `App.tsx`: registrar o handler (rota/overlay `pagamento-pendente`)
- [ ] 2.3 Ordenar após `sessao-longa-com-refresh-token` (só adicionar o ramo `402`, sem tentar refresh)

## 3. Telas

- [ ] 3.1 `src/admin/cobranca/PlanoCobrancaPanel.tsx`: plano, status, fim de teste, uso vs. limite por quota; botões "Assinar"/"Gerenciar cobrança" chamam a API e redirecionam
- [ ] 3.2 `src/admin/configuracoes/ConfiguracoesPage.tsx`: aba "Plano & cobrança" ao lado dos dados da loja
- [ ] 3.3 `src/admin/cobranca/AvisoAssinatura.tsx`: banner de dias restantes em `TESTE`, montado no `AdminLayout`
- [ ] 3.4 `src/admin/cobranca/PagamentoPendentePage.tsx`: tela do `402` com "regularizar" e "já paguei, atualizar"; logout acessível
- [ ] 3.5 `src/admin/cobranca/DadosFaturamentoForm.tsx`: CNPJ com lookup (reusar de `empresas`) + CEP com lookup; campos editáveis; bloqueia assinar com CNPJ não-ativo ou campo faltando; `PUT /api/assinatura/dados-faturamento`
- [ ] 3.6 `src/admin/cobranca/NotasFiscaisList.tsx`: `GET /api/assinatura/notas` (competência, valor, status, link do PDF); estados carregando/vazio/erro

## 3b. Dados fiscais no fluxo de assinar

- [ ] 3b.1 O fluxo "Assinar" exige `DadosFaturamentoForm` completo antes de chamar o checkout
- [ ] 3b.2 `cobranca.api.ts`: `useDadosFaturamento()`, `useSalvarDadosFaturamento()`, `useNotasFiscais()`

## 4. Gating de features

- [ ] 4.1 Telas premium (ex.: `admin/analise`) consultam `usePlano().podeUsar(...)` → desabilitam com chamada de upgrade
- [ ] 4.2 Erro de limite do backend (`ApiError.message`) exibido na tela que tentou a ação

## 5. Testes

- [ ] 5.1 `PlanoCobrancaPanel`: uso vs. limite; "Assinar"/"Gerenciar" chamam a API e redirecionam; estado lido do back após retorno
- [ ] 5.2 `api-client`: `402` autenticado → handler acionado, sem redirect para `/login`, sessão intacta
- [ ] 5.3 `PagamentoPendentePage`: "regularizar" abre a URL; "sair" funciona
- [ ] 5.4 `AvisoAssinatura`: dias restantes em `TESTE`; some em `ATIVA`
- [ ] 5.5 `usePlano`: feature fora do plano desabilita; erro de limite do back aparece na tela
- [ ] 5.6 `DadosFaturamentoForm`: lookup de CNPJ preenche e permite editar; CNPJ inativo bloqueia assinar; `PUT` persiste; edição posterior na aba de cobrança
- [ ] 5.7 `NotasFiscaisList`: lista com link do PDF; estado vazio sem erro

## 6. Checagem de saúde

- [ ] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual com o back (gateway em modo teste): assinar, voltar e ver `ATIVA`; simular inadimplência e ver o bloqueio suave; regularizar
