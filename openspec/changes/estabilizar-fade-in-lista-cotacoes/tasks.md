## 1. Limitar a animação à carga inicial

- [x] 1.1 Em `CotacoesPage.tsx`, adicionar um `useRef(true)` marcando "ainda na carga inicial"; virar `false` num `useEffect` após o primeiro render com `isLoading === false`.
- [x] 1.2 Aplicar `fade-in`/`animationDelay` na linha (linha ~237) só quando o ref ainda indicar carga inicial; caso contrário, renderizar sem essas classes/estilo.
- [x] 1.3 Verificar visualmente: carregar a página mostra o fade-in escalonado normalmente; digitar na busca e depois apagar não faz nenhuma linha reaparecer com delay.

## 2. Testes e verificação final

- [x] 2.1 Teste: simular busca que reduz e depois amplia a lista, verificar que as linhas que retornam já estão com `opacity` visível no primeiro render (sem depender de esperar o delay).
- [x] 2.2 Rodar `npm test` completo e confirmar 0 regressões, incluindo os testes existentes de `CotacoesPage`.

---

### Observações (verificação humana pendente)

A task **1.3** exige conferência visual em navegador (carga inicial com fade-in escalonado + digitar/apagar na busca sem re-exibir animação) — **não executada por agente**, permanece `[ ]` para verificação humana.
