## 1. Contêiner de rolagem

- [x] 1.1 Em `GradeAoVivoTabela.tsx` (linha ~220): no wrapper externo (`rounded-md border ... overflow-hidden`) ou no wrapper interno (`overflow-x-auto`), adicionar `max-h-[65vh] overflow-y-auto` (mantendo o `overflow-x-auto` já existente pra rolagem horizontal) — as duas rolagens (x e y) precisam coexistir no mesmo contêiner pra `sticky` funcionar nos dois eixos.
- [ ] 1.2 Confirmar visualmente que `sticky top-0`/`sticky left-0` das células (linhas 54, 225, 231) passam a funcionar dentro desse contêiner — não deve ser necessário mexer nas classes dessas células, só no wrapper.

## 2. Testes

- [x] 2.1 Teste (se viável em jsdom — sticky/scroll real não é testável em jsdom, então cobrir o que dá: o wrapper tem as classes `max-h-*`/`overflow-y-auto` esperadas) ou, na falta de teste automatizado confiável pra isso, documentar no PR que a verificação é visual (viewport real, muitos itens).
- [x] 2.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões (a suíte de `GradeAoVivoTabela.test.tsx` já existente não deve quebrar).

## 3. Verificação visual

- [ ] 3.1 Testar com uma Cotação real de 70+ itens (dev): rolar verticalmente e confirmar que o cabeçalho da grade (nomes das Empresas) fica visível fixo no topo da grade, sem sobrepor nem ser sobreposto pelo cabeçalho da página.
- [ ] 3.2 Testar rolagem horizontal com várias Empresas: coluna "Item" continua fixa à esquerda.
