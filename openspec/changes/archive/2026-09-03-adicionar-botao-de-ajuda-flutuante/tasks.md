## 1. Conteúdo do FAQ

- [x] 1.1 Criar `src/admin/ajuda/faq.ts` exportando `PERGUNTAS_FREQUENTES: { pergunta: string; resposta: string }[]` com as 4 entradas iniciais: "Como criar uma nova cotação?", "Como convidar representantes?", "Como apurar uma cotação e gerar pedidos?", "Como cancelar uma cotação?" — cada resposta um passo a passo curto em texto (2-4 frases), condizente com os fluxos reais já implementados nas respectivas telas.

## 2. Botão e modal

- [x] 2.1 Criar `src/admin/ajuda/BotaoAjudaFlutuante.tsx`: botão circular fixo (`fixed bottom-6 right-6 z-40`) com ícone `HelpCircle` (lucide-react) e `aria-label="Ajuda"`, que ao clicar abre um `Dialog` (componente já existente em `@/shared/components/ui/dialog`) titulado "Ajuda".
- [x] 2.2 Dentro do `Dialog`, renderizar `PERGUNTAS_FREQUENTES` como uma lista de `<details><summary>{pergunta}</summary><p>{resposta}</p></details>` (ou componente de acordeão equivalente já existente no design system, se houver), estilizados conforme o design system do projeto.
- [x] 2.3 Montar `<BotaoAjudaFlutuante />` em `AdminLayout.tsx`, fora do `<main>` rolável, para ficar fixo em qualquer rota `/admin/**`.

## 3. Testes

- [x] 3.1 Teste: o botão flutuante está presente no DOM ao renderizar `AdminLayout`.
- [x] 3.2 Teste: clicar no botão abre o modal "Ajuda" com as 4 perguntas listadas.
- [x] 3.3 Teste: clicar numa pergunta expande a resposta correspondente.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [x] 4.1 Testar manualmente (dev): navegar por 2-3 rotas `/admin/**` diferentes, rolar a página e confirmar que o botão permanece fixo no canto; abrir o modal, expandir cada pergunta e conferir a legibilidade do conteúdo. **(verificado visualmente pelo dono do produto em 05/09/2026)**
