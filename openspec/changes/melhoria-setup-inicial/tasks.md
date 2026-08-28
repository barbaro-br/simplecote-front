## 1. Setup da Infraestrutura de Testes

- [ ] 1.1 Instalar e configurar o Vitest, RTL, `jsdom` e o MSW no `package.json`. Verificar se o comando `npm test` funciona lendo um arquivo de teste básico.
- [ ] 1.2 Criar o arquivo `src/setupTests.ts` inicializando o servidor MSW e estendendo expect com `jest-dom`. Verificar se testes com requisição falham/sucesso corretamente via interceptação.

## 2. Tipagens e Utilitários de Domínio

- [ ] 2.1 Criar enumerações (`StatusCotacao`, `StatusLance`, etc.) no front em `src/shared/domain/tipos-base.ts`. Verificar importando-os sem erro de TS em componentes dummy.
- [ ] 2.2 Criar utilitários `moeda()` e `dataHoraBr()` em `src/shared/format/formatters.ts` que utilizem `Intl`. Escrever um teste para verificar conversões baseadas nos cenários (ex.: `128.5` virando `R$ 128,50`).

## 3. Tratamento Centralizado de Erros (ApiError)

- [ ] 3.1 Refinar o wrapper HTTP no `api-client.ts` para que, ao receber HTTP 400 ou 500, efetue o parse seguro para verificar a presença dos campos `type`, `title`, e `detail` (RFC 7807) vindos do backend.
- [ ] 3.2 Lançar a exceção customizada `ApiError` formatada. Escrever teste em `api-client.test.ts` e verificar se a conversão do JSON `ProblemDetail` para erro visual funciona.
/