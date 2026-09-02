## 0. Pré-requisito de backend (bloqueante para integração real)

- [ ] 0.1 Confirmar com o repositório `simplecote-back` o contrato de `GET/PUT /api/configuracoes` (ver proposta em `design.md`); ajustar o contrato aqui se o back expuser algo diferente. Enquanto o endpoint não existir, as tasks 1-3 podem ser feitas com um mock local; a task 4 (integração real) fica bloqueada até o endpoint existir.

## 1. Menu e rota

- [x] 1.1 Adicionar item "Configurações" (ícone de engrenagem, ex. `Settings` do lucide-react) ao array `ITENS` em `AdminLayout.tsx`, apontando para `/admin/configuracoes`; verificar que aparece na sidebar e navega corretamente.
- [x] 1.2 Registrar a rota `/admin/configuracoes` em `routes.tsx` dentro do grupo autenticado do admin.

## 2. Tela de Configurações

- [x] 2.1 Criar `src/admin/configuracoes/ConfiguracoesPage.tsx` com formulário (nome, cor, telefone, layout de e-mail) usando `react-hook-form` + `zod`, seguindo o padrão dos outros formulários admin (ex.: `EmpresaForm.tsx`).
- [x] 2.2 Implementar estados de carregamento, erro de salvamento (mensagem do backend) e indicação de "salvando…", conforme os cenários do requirement "Editar dados da loja".
- [x] 2.3 Teste do formulário: salvar com sucesso atualiza os valores exibidos; falha do backend exibe a mensagem e mantém os valores anteriores.

## 3. Aplicar nome e cor na interface

- [x] 3.1 Criar hook/contexto compartilhado (ex. `useConfiguracaoLoja()`) que expõe a configuração atual carregada.
- [x] 3.2 `LoginPage.tsx`: trocar o literal `"SimpleCote"` (linha 53) pelo nome vindo do hook; implementar o estado de carregamento (skeleton) do cenário "Configuração ainda carregando".
- [x] 3.3 `AdminLayout.tsx`: trocar o literal `"SimpleCote"` (linha 77) pelo nome vindo do hook.
- [x] 3.4 Aplicar `corPrimaria` como `--primary` via `document.documentElement.style.setProperty` num ponto único de bootstrap do app (antes de renderizar as rotas); verificar visualmente que botões/foco/destaques em todo o app refletem a nova cor.

## 4. Integração real com o backend (depende da task 0)

- [ ] 4.1 Trocar o mock por chamadas reais a `GET/PUT /api/configuracoes`; verificar end-to-end com o backend rodando localmente.
- [ ] 4.2 Rodar `npm test` completo e confirmar 0 regressões, incluindo os testes de `LoginPage` e `AdminLayout` (que agora dependem da configuração).

## 5. Seed desta loja

- [x] 5.1 Definir o valor inicial da configuração (via seed do backend ou primeira edição manual pela tela) como nome = "Sara Supermercado"; verificar que login e sidebar exibem esse nome.
