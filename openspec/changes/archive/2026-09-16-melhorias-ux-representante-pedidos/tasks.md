## Tasks

### Fase 1: Ajustes no Painel Administrativo (Comprador)
- [x] 1. Adicionar `max-h-[300px] overflow-y-auto scrollbar-thin` no container que lista os itens da empresa na tela de `ResultadoPage` (Pedidos Gerados).
- [x] 2. Renomear o botão e o texto auxiliar/tooltip da ação de envio do pedido de `Marcar como enviado` para `Enviar por e-mail`.

### Fase 2: Reestilização do Workspace do Representante (Tema Claro / Brutalista)
- [x] 3. Inspecionar o componente raiz do representante (`src/representante/**/*.tsx`) e substituir classes `rounded-*` por `rounded-none`.
- [x] 4. Aplicar fontes mono (`font-mono`) em indicadores técnicos e preços nos cards de itens da cotação.
- [x] 5. Ajustar inputs do formulário do representante (preço e prazo) para obedecer à estética sem bordas arredondadas e de alto contraste linear.

### Fase 3: Comprovante PDF do Representante
- [x] 6. Adicionar na tela de "Resumo/Sucesso" (quando a cotação é fechada) um botão "Baixar Recibo (PDF)".
- [x] 7. Mapear o endpoint de download (ex: `api.getBlob('/api/cotacoes/publica/' + token + '/pdf')`) e lidar com a resposta para forçar o download. *(Se o back ainda não tiver essa rota específica para token, fazer o request na OpenAPI/mock)*.
