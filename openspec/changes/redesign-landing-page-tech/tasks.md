## 1. Setup e Dependências

- [x] 1.1 Instalar o `framer-motion` no projeto e verificar se a instalação ocorreu sem erros rodando `npm run build`.
- [ ] 1.2 Converter a logo fornecida (`.jpg`) para um componente React puro (usando um SVG otimizado com a mesma estrutura) e verificar a renderização renderizando-o em um layout de teste.
- [ ] 1.3 Adicionar as variáveis de cores (`brand-navy` e `brand-mint`) na configuração CSS/Tailwind (v4) e verificar se o compilador reconhece as classes (ex: `text-brand-navy`).

## 2. Redesign da Casca Pública (Header/Footer)

- [ ] 2.1 Atualizar o componente de Header público para exibir o novo SVG da logo e o novo estilo com glassmorphism (fundo borrado) e verificar rodando `npm run dev`.
- [ ] 2.2 Atualizar o Footer público com as novas cores e a logo nova e verificar a visualização visual.

## 3. Redesign da Home Institucional (Hero e Vídeo)

- [ ] 3.1 Refatorar a `HomePage` (`src/site/HomePage.tsx`) adicionando a estrutura de vídeo em autoplay como *background cover* (usando um vídeo ou div placeholder por enquanto) e verificar se o vídeo ocupa a tela inteira atrás do conteúdo.
- [ ] 3.2 Implementar os textos sobrepostos e os CTAs ("Criar conta" e "Entrar") com `framer-motion` para fade-in e verificar no navegador se eles animam ao carregar.
- [ ] 3.3 Adicionar o hook `useReducedMotion` do Framer Motion para desativar a reprodução do vídeo e as animações se o sistema operacional pedir, e verificar via DevTools (emulando preferência de redução de movimento).

## 4. Redesign das Seções de Planos e Demonstração

- [ ] 4.1 Refatorar a seção de planos da Home e a `/precos` para exibir os cards com o efeito "glass" e animação hover com `framer-motion`. Verificar a legibilidade do texto.
- [ ] 4.2 Reestruturar a seção "veja em ação" para integrar o player de vídeo do produto de forma orgânica ao layout novo e verificar se os controles do player aparecem.
- [ ] 4.3 Implementar a animação de scroll (fade-up ou reveal) nas seções usando `whileInView` do `framer-motion`, checando a fluidez ao descer a barra de rolagem.

## 5. Revisão Final e Testes

- [ ] 5.1 Atualizar os testes unitários do RTL para `HomePage` e componentes relacionados caso classes essenciais ou textos tenham mudado (executar `npm test`).
- [ ] 5.2 Executar o Health Gate (`npm test`, `npm run build`, `npm run lint`) garantindo que nenhuma mudança visual quebrou os testes ou gerou erros de lint.
