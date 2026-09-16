## Technical Design

### 1. Painel Administrativo (`ResultadoPage.tsx` ou similar)
- Alterar o `AccordionContent` que lista os itens para utilizar as classes utilitárias do Tailwind `max-h-[300px] overflow-y-auto scrollbar-thin`.
- Na listagem de botões agrupados, encontrar o tooltip/texto `Marcar como enviado` e alterar para `Enviar por e-mail`.

### 2. Painel do Representante (`CotacaoPorTokenPage` / `Tela Representante`)
- **Estilização Brutalista/Planilha:** Varredura nas classes do layout base do representante (removendo `rounded-md`/`rounded-xl`/`rounded-2xl`). Utilizar `rounded-none`, adicionar bordas demarcadas. Manter as cores de preenchimento brancas/cinzas claras.
- **Botão Download de Recibo (PDF):** Se o `status` da cotação estiver concluído, disponibilizar na interface de sucesso (`/representante/cotacao/resumo` ou na página principal read-only) um botão (link `a` ou `Button` simulado) acionando a rota do backend correspondente (`GET /api/cotacoes/{id}/pdf` - possivelmente já existente para gerar o espelho do comprador, pode necessitar adaptação de token, mas em geral, o backend pode gerar o PDF e retornar). 
*(Nota: a geração de PDF de cotação pública por token precisará que o backend forneça essa rota livre/tokenizada).* Se não existir a rota livre no back, deveremos documentar essa necessidade.

### Dependencies
- O backend precisará fornecer o endpoint para o PDF do recibo através de validação de token do representante (`GET /api/cotacoes/publica/{token}/recibo.pdf`), sem depender do JWT do Comprador.
