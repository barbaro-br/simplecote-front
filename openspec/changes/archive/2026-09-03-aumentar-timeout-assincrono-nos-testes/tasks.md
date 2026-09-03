## 1. Configuração global

- [x] 1.1 Em `src/setupTests.ts`: importar `configure` de `@testing-library/dom` (ou `@testing-library/react`, o que o projeto já usa) e chamar `configure({ asyncUtilTimeout: 3000 })` no topo do arquivo, antes dos hooks `beforeAll`/`afterEach`.

## 2. Verificação

- [x] 2.1 Rodar a suíte completa (`npm test`) pelo menos 3 vezes seguidas e confirmar 0 falhas em nenhuma das rodadas (o teste `CotacoesPage.test.tsx > lista as cotações retornadas pela API`, que falhava intermitentemente antes, não deve mais falhar).
- [x] 2.2 Confirmar que a duração total da suíte não aumenta de forma perceptível (o timeout maior só é usado quando necessário — testes que já passam rápido continuam rápidos).
