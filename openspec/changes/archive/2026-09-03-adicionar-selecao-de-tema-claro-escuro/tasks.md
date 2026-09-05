## 0. Pré-requisito

- [x] 0.1 Confirmar que a change `adicionar-tema-de-cor-a-configuracao-da-loja` (repo `simplecote-back`) já está implementada e o backend em execução expõe `tema` em `GET /api/configuracoes` — sem isso, os passos abaixo não têm o que ler/gravar.

## 1. Schema e API

- [x] 1.1 Em `configuracoes.schema.ts`: adicionar `export type Tema = 'CLARO' | 'ESCURO'` e `tema: z.enum(['CLARO', 'ESCURO'])` ao schema do formulário.
- [x] 1.2 Em `configuracoes.api.ts`: adicionar `tema: 'CLARO'` ao valor default usado enquanto a configuração real carrega.

## 2. UI em Configurações

- [x] 2.1 Em `ConfiguracoesPage.tsx`: adicionar um bloco de seleção "Tema" com radio buttons "Claro"/"Escuro", mesmo padrão visual do bloco existente de "Estilo de navegação" (`{...form.register('tema')}`).

## 3. Aplicar o tema

- [x] 3.1 Em `ConfiguracaoLojaProvider.tsx`: adicionar um `useEffect` que alterna `document.documentElement.classList.toggle('dark', data?.tema === 'ESCURO')` a cada mudança de `data?.tema`.

## 4. Testes

- [x] 4.1 Teste: `ConfiguracaoLojaProvider` com `tema: 'ESCURO'` adiciona a classe `dark` ao elemento raiz; com `tema: 'CLARO'` (ou ausente), a classe não é adicionada (ou é removida).
- [x] 4.2 Teste: `ConfiguracoesPage` renderiza os dois radio buttons de tema, refletindo o valor atual da configuração, e salva a alteração via `PUT`.
- [x] 4.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 5. Verificação visual

- [x] 5.1 Testar manualmente (dev, com o backend da change de pré-requisito já rodando): em Configurações, trocar pra "Escuro" e salvar — confirmar que o painel inteiro (não só um componente) passa a refletir o tema escuro; voltar pra "Claro" e confirmar que volta ao normal. **(verificado visualmente pelo dono do produto em 05/09/2026)**
