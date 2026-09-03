## Why

`src/admin/cotacoes/CotacoesPage.test.tsx` (`lista as cotações retornadas pela API`) falha de forma intermitente quando a suíte completa roda (`npm test`), mas passa 100% das vezes quando roda isolado — reproduzido várias vezes nesta sessão (3x isolado passou, várias vezes na suíte completa falhou no mesmo teste). Causa raiz: o `@testing-library` usa timeout padrão de 1000ms pros `findBy*`/`waitFor`; sob a suíte completa (55 arquivos, `pool: forks`, muitos workers competindo por CPU ao mesmo tempo), o `findByRole` após o `renderPage()` (que depende do MSW responder um fetch simulado) ocasionalmente não completa dentro de 1s, mesmo o comportamento estando correto. Já era um padrão conhecido nesta sessão (flakiness anterior atribuída a contenção de CPU), mas nunca formalizado como correção.

## What Changes

- `setupTests.ts`: configurar `asyncUtilTimeout` do `@testing-library/dom` mais alto (ex.: 3000ms) globalmente, em vez de aumentar teste por teste — protege qualquer teste que dependa de fetch simulado sob a mesma condição de carga, não só o caso já observado.

## Capabilities

### Modified Capabilities

- `core/test-infra`: novo requirement — timeout de espera assíncrona nos testes tolerante à contenção de CPU da suíte completa.

## Impact

- `src/setupTests.ts` — configuração global de timeout do testing-library.
- Nenhuma mudança de comportamento de produto — é infraestrutura de teste.
