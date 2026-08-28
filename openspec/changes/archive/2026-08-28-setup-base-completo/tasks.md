## 1. Setup Base de Componentes e Rotas

- [x] 1.1 Limpar o código boilerplate inicial do Vite (`App.tsx` e `main.tsx`) e instalar `react-router-dom` e dependências shadcn/ui. Verificar que a home inicialização limpa roda sem erros de bundle.
- [x] 1.2 Criar os layouts `src/admin/layout/AdminLayout.tsx` (com mock visual para as rotas admin) e a casca isolada do representante. Verificar carregamento via teste de routing.
- [x] 1.3 Adicionar tokens de tema primários descritos na documentação para dentro do arquivo `src/index.css`. Verificar que botões shadcn pegam os novos valores.

## 2. Infraestrutura de Testes e Types

- [x] 2.1 Instalar e configurar o Vitest, `@testing-library/react`, `jsdom` e o MSW. Verificar se o comando `npm test` funciona lendo um arquivo de teste basilar de interceptação.
- [x] 2.2 Criar enumerações (`StatusCotacao`, `StatusLance`, etc) e DTOs de erro no front em `src/shared/domain/tipos-base.ts`. Verificar sem erro de tipagem.
- [x] 2.3 Criar utilitários `moeda()` e `dataHoraBr()` em `src/shared/format/formatters.ts` que utilizem `Intl`. Escrever um teste cobrindo cenários (ex.: `128.5` virando `"R$ 128,50"`).

## 3. Rede e Tratamento de Erros

- [x] 3.1 Instalar `@tanstack/react-query` e envolver o aplicativo no `QueryClientProvider`. Verificar que o contexto Global expõe o cache no React DevTools.
- [x] 3.2 Criar o wrapper `api-client.ts` com base na Fetch API e mapeando erros padrão 4xx/5xx (RFC 7807 `ProblemDetail`) para a exceção customizada `ApiError`. 
- [x] 3.3 Escrever teste via MSW garantindo que se a rede lançar falha 400 em JSON de `ProblemDetail`, o `api-client` consome e empacota perfeitamente a mensagem em pt-BR.
