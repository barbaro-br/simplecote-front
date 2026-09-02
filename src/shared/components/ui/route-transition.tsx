import { useLocation, useOutlet } from 'react-router-dom';

export function RouteTransition() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  // Apenas um fade-in leve no novo conteúdo (a `key` remonta o wrapper a cada
  // troca de rota e dispara a animação). Sem startViewTransition: o crossfade de
  // snapshot do View Transition API causava um "salto" visível na navegação.
  return (
    <div key={location.pathname} className="fade-in">
      {currentOutlet}
    </div>
  );
}
