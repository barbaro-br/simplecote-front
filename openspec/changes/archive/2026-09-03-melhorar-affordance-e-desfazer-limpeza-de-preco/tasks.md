## 1. Desfazer ao limpar preço

- [x] 1.1 Em `ItemLanceCard.tsx`, no `useEffect` que trata `valorDebounced === ''` (linha ~54-61): antes de zerar `jaEnviadoRef.current`, guardar o valor anterior numa variável local; após chamar `aoAssentar({ naoCotado: true })`, disparar `toast('Preço removido', { action: { label: 'Desfazer', onClick: () => setPrecoTexto(valorAnterior) }, position: 'top-center' })` (import `toast` de `sonner`).
- [x] 1.2 Só disparar o toast quando havia de fato um preço antes (não disparar num campo que já estava vazio, nem no carregamento inicial do card).
- [x] 1.3 Confirmar que "Desfazer" restaura corretamente o valor no input e que o fluxo normal de debounce/sincronização re-envia esse preço como se o representante tivesse digitado de novo (sem precisar de nenhum caminho especial de "restaurar").

## 2. Demonstração do gesto no tutorial

- [x] 2.1 Em `TutorialOnboarding.tsx`: no último passo (`conteudo: 'fim'`), adicionar uma animação no `MiniCard` de exemplo — desliza a translação X do card pra esquerda (ex.: `-40px` a `-60px`) e de volta, em loop suave ou uma vez ao entrar no passo, revelando visualmente o fundo/ícone de "limpar" atrás dele (reaproveitar a mesma lógica visual de fundo revelado que `ItemLanceCard.tsx` já usa, adaptada pro `MiniCard`).
- [x] 2.2 Manter o texto descritivo já existente (`desc`) — a animação complementa, não substitui a explicação.

## 3. Testes

- [x] 3.1 Teste: limpar um preço já digitado (via `setPrecoTexto('')` simulando swipe, ou apagando o input) dispara o toast "Preço removido" com ação "Desfazer".
- [x] 3.2 Teste: acionar "Desfazer" restaura o valor anterior no campo.
- [x] 3.3 Teste: esvaziar um campo que já estava vazio (nada digitado ainda) NÃO dispara o toast.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Testar em viewport mobile real (ou emulado): tutorial mostra a animação do gesto no último passo; limpar um preço (swipe e teclado) mostra o toast no topo, sem colidir com a barra de ação fixa na base.
