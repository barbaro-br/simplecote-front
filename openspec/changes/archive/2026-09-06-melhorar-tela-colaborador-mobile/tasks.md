## 1. Cabeçalho fixo (colaborador)

- [x] 1.1 Em `ColaboradorPage.tsx`, tornar o cabeçalho (título da cotação + nome da loja) `sticky top-0` com fundo opaco — verificar visualmente em largura de 375px que ele permanece fixo no scroll
- [x] 1.2 Teste: o cabeçalho possui a classe/estilo de fixação esperado (ou comportamento de stickiness) sem quebrar o estado "sem cotação"/"link inválido"

## 2. Cadastro de produto sem bipar (front + back irmão)

- [x] 2.1 Adicionar ação "Cadastrar produto" sempre visível (ao lado de "Bipar") em `ColaboradorPage.tsx`, abrindo o formulário de cadastro (nome, unidade, qtd/emb, quantidade) sem `gtin` — verificar que aparece independente do fluxo de bipagem
- [x] 2.2 Em `colaborador.api.ts`, habilitar o envio de cadastro sem `gtin` (payload sem o campo ou vazio) e ajustar `colaborador.schema.ts` se necessário
- [x] 2.3 Confirmar com a change irmã (`simplecote-back`) que `gtin` é opcional no endpoint de cadastro; registrar status do deploy do back no handoff
- [x] 2.4 Teste MSW: cadastro sem bipar cria e adiciona o item (sucesso) e valida campos inválidos (sem criar)

## 3. Feedback admin (toast via SSE)

- [x] 3.1 Em `cotacoes.api.ts` (`useGradeAoVivoSSE`), adicionar listener para o evento de item adicionado e disparar `toast.success` — verificar que o toast aparece ao receber o evento
- [x] 3.2 Teste: ao emitir o evento SSE (mock), o toast é chamado uma vez por item (com deduplicação de rajada)

## 4. Checagem de saúde

- [x] 4.1 `npm test` verde (Vitest + RTL)
- [x] 4.2 `npm run build` e `npm run lint` sem erro novo
