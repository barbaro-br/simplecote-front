## Context

O painel admin já usa `Dialog` (`src/shared/components/ui/dialog.tsx`)
como padrão único de modal em toda a aplicação (formulários de
produto/empresa/usuário, etc.) — reaproveitar em vez de introduzir um
painel lateral/slide-over novo, que não existe hoje no admin (só na tela
mobile do representante, um contexto diferente).

## Decision

`BotaoAjudaFlutuante.tsx`: um `<button>` circular fixo
(`fixed bottom-6 right-6 z-40 size-12 rounded-full bg-primary
text-primary-foreground shadow-lg`) com o ícone `HelpCircle`
(lucide-react), `aria-label="Ajuda"`. Ao clicar, abre um `Dialog`
(`size="md"` ou equivalente) com título "Ajuda" e uma lista de
`<details>`/acordeão simples (pode ser HTML nativo `<details><summary>`
estilizado, sem precisar de componente novo de accordion) para as 4
perguntas.

`faq.ts` exporta um array `PERGUNTAS_FREQUENTES: { pergunta: string;
resposta: string }[]` com o conteúdo inicial:

1. "Como criar uma nova cotação?" — passo a passo curto (Cotações → Nova
   cotação → título ou duplicar → Criar).
2. "Como convidar representantes?" — (abrir o detalhe da cotação →
   Representantes → selecionar empresas → Convidar).
3. "Como apurar uma cotação e gerar pedidos?" — (Encerrar → Apurar →
   revisar resultado → Enviar pedidos).
4. "Como cancelar uma cotação?" — (detalhe da cotação → Cancelar →
   confirmar).

Montado uma vez em `AdminLayout.tsx`, fora do `<main>` rolável, pra ficar
fixo na viewport em qualquer rota `/admin/**`.

## Alternatives Considered

- **Chat/assistente com IA**: rejeitado nesta primeira versão — custo e
  complexidade desproporcionais a "um FAQ em texto"; se o time sentir
  falta depois, é uma evolução natural do mesmo botão.
- **Conteúdo em Markdown carregado de arquivo externo**: rejeitado por
  ora — 4 perguntas cabem bem como array TS tipado; migrar pra Markdown
  só se o conteúdo crescer muito.
