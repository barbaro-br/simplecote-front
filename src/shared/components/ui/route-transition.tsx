import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

export function RouteTransition() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [displayOutlet, setDisplayOutlet] = useState(currentOutlet);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          setDisplayLocation(location);
          setDisplayOutlet(currentOutlet);
        });
      } else {
        setTransitionStage("fadeOut");
      }
    }
  }, [location.pathname, displayLocation.pathname, currentOutlet]);

  return (
    <div
      className={`w-full h-full transition-opacity duration-200 ease-in-out ${
        transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={() => {
        if (transitionStage === "fadeOut") {
          setDisplayLocation(location);
          setDisplayOutlet(currentOutlet);
          setTransitionStage("fadeIn");
        }
      }}
    >
      {displayOutlet}
    </div>
  );
}
