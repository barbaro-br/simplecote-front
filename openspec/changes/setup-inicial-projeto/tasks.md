## 1. Setup Base e Ferramental

- [ ] 1.1 Configurar aliases de path (`@/`) no `tsconfig.app.json` e `vite.config.ts`, e verificar se importação com alias compila corretamente.
- [ ] 1.2 Instalar dependências base do projeto (`react-router-dom`, `@tanstack/react-query`, `lucide-react`) e verificar se a instalação termina com sucesso.
- [ ] 1.3 Adicionar tokens de design base do SimpleCote (variáveis CSS) em `src/index.css` e verificar se a renderização inicial não quebra.

## 2. Tipagens e Utilitários

- [ ] 2.1 Criar a definição de `ApiError` estendendo os erros básicos pra lidar com `ProblemDetail`. Verificar via checagem de tipos (tsc).
- [ ] 2.2 Criar DTOs base compartilhados e o utilitário `api-client.ts` com o wrapper de `fetch`. Escrever um teste unitário com MSW para verificar a resposta de sucesso e interceptação de `ProblemDetail`.

## 3. Estrutura de Roteamento (Shell)

- [ ] 3.1 Criar layout vazio base do admin (`src/admin/layout/AdminLayout.tsx`) e verificar se renderiza sem crashar.
- [ ] 3.2 Criar páginas placeholder para `/admin` (Dashboard vazio) e para `/cotacao/:token` (Formulário vazio). Verificar as duas via dev server ou render básico em RTL.
- [ ] 3.3 Configurar o `react-router-dom` em `src/routes.tsx` para definir as duas árvores (dentro e fora do `AdminLayout`) e montar no `main.tsx`. Verificar navegando localmente pelas rotas.

## 4. Integração Global

- [ ] 4.1 Envolver a aplicação no `QueryClientProvider` no `main.tsx`. Verificar checando se o dev server inicializa sem erros.
