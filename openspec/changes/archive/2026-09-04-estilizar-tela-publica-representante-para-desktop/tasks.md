## 1. Layout de desktop

- [x] 1.1 Identificar o componente raiz da tela `/cotacao/:token` e o breakpoint (Tailwind) já usado no projeto para distinguir mobile/desktop.
- [x] 1.2 Envolver o conteúdo (saudação/contexto/prazo + lista de itens) num contêiner com largura máxima (`max-w-*` + `mx-auto`) ativo a partir do breakpoint de desktop, preservando o layout mobile abaixo dele.
- [x] 1.3 Garantir que o fundo da página fora do contêiner central usa o mesmo token de cor do tema claro já usado hoje.
- [x] 1.4 Conferir visualmente que nenhum dado/rótulo (P.CX, P.UN, código de barras, quantidade, status) some ou perde legibilidade no novo layout.
- [x] 1.5 Testar em pelo menos duas larguras de desktop (ex.: 1280px e 1920px) e reconfirmar que o comportamento mobile (≤768px) não regrediu.
- [x] 1.6 (revisão manual) Adicionar cabeçalho visível só em desktop (`hidden md:block`) com título/saudação/empresa/prazo, já que o container mais largo sozinho não resolvia a sensação de tela vazia sem identidade.
- [x] 1.7 (revisão manual) Esconder o bloco de texto duplicado (título/saudação/empresa/prazo) da barra fixa inferior em desktop (`md:hidden`), mantendo só a bolha de progresso e o botão Finalizar lá — evita repetir a mesma informação duas vezes na tela.
- [x] 1.8 (revisão manual) Mover o código de barras do item para uma linha abaixo da quantidade/embalagem, em vez de ao lado do nome do produto — ficava apertado.
- [x] 1.9 (revisão manual) Ajustar os 2 testes de `CotacaoPorTokenPage.test.tsx` que assumiam um único elemento de texto para saudação/prazo, já que agora existem 2 (um por breakpoint, controlado por CSS).
