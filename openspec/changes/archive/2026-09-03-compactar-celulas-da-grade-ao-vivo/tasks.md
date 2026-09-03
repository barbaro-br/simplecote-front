## 1. Condensar as células

- [x] 1.1 Em `GradeAoVivoTabela.tsx`, dentro do `<button>` da célula: remover o bloco `<div className="flex items-center justify-end gap-1.5 mb-0.5">` que hoje renderiza "COTADO" e o badge "MENOR".
- [x] 1.2 Quando `celula.status === 'COTADO' && celula.preco != null`: trocar o `<div className="flex flex-col">` (duas linhas empilhadas) por um único elemento numa linha, com o preço da embalagem em destaque (`font-semibold`) seguido de um separador (`·`) e o preço unitário em tom secundário (`text-muted-foreground`), preservando `ehMenor ? 'text-success' : 'text-foreground'` no preço principal.
- [x] 1.3 Quando a célula não está `COTADO` (`PENDENTE`/`NAO_COTADO`): manter só a pílula de status (`rotuloStatus`); remover a linha `<span className="block text-muted-foreground/50 text-sm">—</span>`.
- [x] 1.4 Conferir que a classe `min-h-[2.5rem]` do botão da célula ainda faz sentido com o conteúdo de uma linha só — reduzir se necessário para o efeito de "linha mais fina" ser perceptível (ajustar durante a verificação visual).

## 2. Testes

- [x] 2.1 Atualizar `GradeAoVivoTabela.test.tsx`: os testes que hoje buscam o texto "COTADO" ou "MENOR" passam a verificar a ausência desses textos e a presença do preço+unitário na mesma linha.
- [x] 2.2 Teste: célula `PENDENTE`/`NAO_COTADO` não renderiza mais o traço "—" além da pílula.
- [x] 2.3 Teste: célula que é o menor preço do item continua com a classe/estilo de destaque em verde (`ehMenor`), mesmo sem o texto "MENOR".
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): criar uma cotação com 2+ participantes cotando preços diferentes e confirmar visualmente que a grade ficou mais fina, com preço+unitário numa linha, sem os textos "COTADO"/"MENOR", e que o menor preço continua claramente identificável pela cor.
