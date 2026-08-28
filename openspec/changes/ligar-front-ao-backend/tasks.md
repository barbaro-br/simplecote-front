## 1. Configuração de ambiente

- [ ] 1.1 Criar `.env.development` e `.env.example` (na raiz) com `VITE_API_BASE_URL=http://localhost:8080` (o `.example` com um comentário citando `spec.md` §6). Se `limpar-scaffold-shadcn` já criou o `.env.example`, apenas conferir o conteúdo. Verificar: `git check-ignore .env.development .env.example` não retorna nada; `npx vitest run` continua verde (handlers MSW `*/api/...` seguem casando).
- [ ] 1.2 Conferir `vite.config.ts` (proxy `/api` → `:8080`) e `api-client.getBaseUrl()`: com `VITE_API_BASE_URL` setado, as chamadas viram absolutas para `:8080`; sem ele, caem no proxy. Ajustar só se algo estiver inconsistente. Verificar: `npm run dev` sobe e uma chamada a `/api/produtos` sai para `http://localhost:8080/api/produtos` (aba Network).

## 2. Roteiro de desenvolvimento

- [ ] 2.1 Adicionar seção "Desenvolvimento local" ao `README.md`: (a) subir o backend em `simplecote-back` com `AUTH_ENABLED=true ./mvnw spring-boot:test-run` (porta 8080, requer Docker para o Testcontainers Postgres); (b) `cp .env.example .env.development` e `npm run dev` no front; (c) logar em `/login` com `admin@dev.local` / `admin123` (semeados pelo `SeedDadosDev`). Verificar: seguir o README do zero leva a um painel logado.

## 3. Verificação ponta a ponta contra o backend vivo

- [ ] 3.1 Subir back (auth ligada) + front. `/login` com `admin@dev.local`/`admin123` → token guardado em `sessionStorage`, redireciona para `/admin`. Corrigir divergência de contrato se houver (shape de `{ token }`, path). Verificar: recarregar a página mantém a sessão; `/admin` abre.
- [ ] 3.2 `/admin/produtos`: listar (deve trazer os produtos semeados), criar um produto novo (aparece na lista), inativar (some/fica marcado). Corrigir divergências de campo/shape contra a resposta real (`/swagger-ui.html`). Verificar: as 3 operações refletem no backend (conferir via GET direto ou recarregando).
- [ ] 3.3 `/admin/empresas`: listar, criar empresa com representante (as duas requisições sequenciais concluem), editar o nome. Corrigir divergências. Verificar: empresa + representante persistidos no backend.
- [ ] 3.4 Se qualquer divergência for estrutural (endpoint inexistente, fluxo que o backend não suporta), pausar e sinalizar em vez de improvisar.

## 4. Roadmap no repo

- [ ] 4.1 Em `spec.md` (front), atualizar a §7: marcar cada item das Fases 1/2/3 e do "Por último" como ✅ feito / 🟡 parcial / ❌ pendente, conforme o estado real (login/guard feito; Produtos e Empresas feitos; Cotações e tela do representante pendentes; etc.).
- [ ] 4.2 Corrigir os trechos defasados de `spec.md` §1 e §2 que dizem "sem login até o JWT existir" — o JWT existe e o painel agora loga de verdade.
- [ ] 4.3 Acrescentar a subseção "## Estado atual (2026-08-28)" ao `spec.md` com: o gap até a Fase 1 completa (Cotações admin, tela do representante), e os follow-ups explícitos (`/admin/representantes` dedicada, grade ao vivo da Fase 2, itens da Fase 3, CI). Verificar: a seção lista changes/itens rastreáveis, não texto vago.

## 5. Fechamento

- [ ] 5.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [ ] 5.2 `openspec validate ligar-front-ao-backend` sem erros.
