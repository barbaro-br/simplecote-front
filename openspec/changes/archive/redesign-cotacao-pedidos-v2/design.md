## Context

Conforme detalhado no `proposal.md`, o objetivo é trazer uma interface gerada via Google Stitch (Tailwind + HTML puro, prototipada no diretório `new-front`) para dentro da arquitetura robusta do `simplecote-front`. Como o sistema já está em produção, precisamos fazer isso de forma incremental e reversível (Feature Flag).

## Goals / Non-Goals

**Goals:**
- Portar o HTML/Tailwind do export do Stitch para componentes React tipados no `simplecote-front`.
- Ligar os novos componentes visuais às lógicas de estado e validação (Zod, React Hook Form) já existentes.
- Criar um mecanismo de Feature Flag cliente-side para ligar/desligar a V2.

**Non-Goals:**
- Mudar os endpoints do backend.
- Alterar as regras de validação do domínio (Zod Schemas).
- Substituir o roteador ou bibliotecas base do projeto.

## Decisions

**1. Mecanismo de Feature Flag: `useFeatureFlag` hook + `localStorage`**
- *Por que:* É a abordagem mais leve para um opt-in de interface. 
- *Como:* Criaremos um hook `useFeatureFlag('ui_cotacao_v2')`. O usuário terá um *toggle* em seu menu superior ou painel de configurações. Ao ativar, salva no `localStorage` e a página re-renderiza. Nas rotas de Cotação e Pedidos, faremos um condicional simples: `return isV2 ? <PedidosV2 /> : <PedidosV1 />`.
- *Alternativas consideradas:* Banco de dados (tabela de preferências). Descartada por ser overhead para um teste de UI temporário.

**2. Estrutura de Componentes V2**
- *Por que:* Evitar poluir o código funcional antigo.
- *Como:* Criaremos diretórios paralelos ou arquivos sufixados com `V2` (ex: `src/admin/cotacoes/CotacaoFormV2.tsx`). A V2 irá importar e reutilizar os hooks de mutação (`useMutation`) e validação que a V1 já usa, separando apenas a Camada de Visão (JSX).

**3. Integração do Código Stitch (Tailwind)**
- *Por que:* O Stitch gera classes completas de Tailwind que podem divergir sutilmente do nosso `tailwind.config`.
- *Como:* Os estilos e cores base exportados do Stitch (ex: variáveis do tema Material/Geist) serão avaliados e injetados no nosso `index.css` global ou mesclados no nosso tema Tailwind v4, garantindo que o novo visual renderize 100% igual ao protótipo gerado.

**4. A Aba de Pedidos (Layout Sanfona)**
- *Como:* O componente `<PedidosV2 />` fará um `groupBy` no array de itens de pedido, agrupando por `empresaId`. Ele renderizará um componente Accordion/Sanfona no nível da empresa, exibindo o valor total ganho por ela no cabeçalho fixo. O corpo da sanfona conterá as linhas (itens) reais vencidos por aquela empresa.

## Risks / Trade-offs

- [Conflito de Tailwind] → O Tailwind v4 gerado no `new-front` pode ter tokens de cor (como `surface-container`) ausentes no projeto original. *Mitigação:* Copiar os tokens de cor do arquivo `code.html` do export do Stitch para o CSS raiz do `simplecote-front`.
- [Code Bloat Temporário] → Duplicação de views (V1 e V2) aumenta o bundle JavaScript. *Mitigação:* É temporário. Assim que a V2 for considerada estável e oficial, uma *change* de faxina apagará os arquivos da V1.
