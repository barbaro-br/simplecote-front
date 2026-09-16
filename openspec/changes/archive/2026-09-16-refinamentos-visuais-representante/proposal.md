## Why
Embora a interface do representante tenha recebido cantos quadrados, alguns detalhes ainda desviam do design dark brutalista. O fundo dos cards de itens ficou da mesma cor da página, faltando contraste. O select de condições de pagamento está exibindo fundo branco inadequado. A superfície geral da página e a tag de status ainda conservam bordas arredondadas, e há textos que poderiam ser redigidos e formatados de forma mais imersiva (maiúsculo, descrição mais encorpada e indicadores de status com ping animado).

## What Changes
1. Escurecimento do bg dos cards de preço na `LinhaPreco`.
2. Correção de fundo branco vazando nos inputs das condições de pagamento.
3. `<Superficie>` (card global) com cantos quadrados.
4. Título da cotação renderizado em maiúsculo (`uppercase`).
5. Redação e ampliação do texto de boas-vindas do Representante ("Olá X, você representa Y").
6. Tag de status quadrada e com indicativo pulsante "animado" quando está "Aberta".
