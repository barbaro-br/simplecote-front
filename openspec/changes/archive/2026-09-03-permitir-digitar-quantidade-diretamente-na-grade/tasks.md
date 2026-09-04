## 1. Campo digitável de quantidade

- [x] 1.1 Em `GradeAoVivoTabela.tsx` (componente da linha do item): trocar o `<span className="min-w-6 text-center text-xs font-medium tabular-nums">{item.quantidadeSolicitada}</span>` por um `<input type="number" inputMode="numeric" min={1}>` com estado local (`useState<string>`) inicializado com `String(item.quantidadeSolicitada)`.
- [x] 1.2 Sincronizar o estado local quando `item.quantidadeSolicitada` mudar por fonte externa (ex.: evento SSE atualizando a grade enquanto o campo não está focado) — não sobrescrever o que o Comprador está digitando no meio da edição.
- [x] 1.3 `onBlur` e `onKeyDown` (Enter → `blur()`): parsear o valor, validar `Number.isInteger(v) && v >= 1`; se válido e diferente do valor atual, chamar `aoAtualizarQuantidade(item.itemCotacaoId, v)`; se inválido, reverter o estado local para `String(item.quantidadeSolicitada)` sem chamar a função.
- [x] 1.4 `disabled={quantidadePendente}` no input, mesma condição já usada nos botões `[-]`/`[+]`.
- [x] 1.5 Estilo: input estreito (`w-10`/`w-12`), `text-center`, `tabular-nums`, mantendo os botões `[-]`/`[+]` nas mesmas posições ao redor.

## 2. Testes

- [x] 2.1 Teste: digitar um valor válido no campo e sair (blur) chama `aoAtualizarQuantidade` com o valor digitado.
- [x] 2.2 Teste: digitar Enter no campo tem o mesmo efeito do blur.
- [x] 2.3 Teste: digitar um valor inválido (vazio, "0", "-1", texto não numérico) e sair do campo NÃO chama `aoAtualizarQuantidade`, e o campo volta a exibir o valor anterior.
- [x] 2.4 Teste: em `PEDIDOS_GERADOS`/`CANCELADA`, o campo não é editável (mesma condição de `quantidadeEditavel` já usada para os botões).
- [x] 2.5 Teste: os botões `[-]`/`[+]` continuam funcionando exatamente como antes.
- [x] 2.6 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar manualmente (dev, Cotação `ABERTA`): clicar no campo de quantidade de um item, digitar um valor bem diferente (ex.: de 5 para 50) e confirmar com Enter — a grade deve refletir o novo valor sem recarregar a página.
- [ ] 3.2 Testar manualmente: digitar um valor inválido (ex.: "0") e sair do campo — confirmar que volta ao valor anterior sem chamar a API.
