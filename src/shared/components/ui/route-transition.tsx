import { useLocation, useOutlet } from 'react-router-dom';

export function RouteTransition() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  // Apenas um fade-in leve no novo conteúdo (a `key` remonta o wrapper a cada
  // troca de rota e dispara a animação). Sem startViewTransition: o crossfade de
  // snapshot do View Transition API causava um "salto" visível na navegação.
  // `flex-1 min-h-0 flex flex-col` deixa uma página que queira ocupar a altura
  // toda (ex.: a tela de cotação, com grade rolável) se esticar; páginas comuns
  // ignoram e seguem no fluxo normal (rolam via <main>).
  return (
    <div key={location.pathname} className="fade-in flex min-h-0 flex-1 flex-col">
      {currentOutlet}
    </div>
  );
}
