import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

export function useConvexReady() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Esperar un poco para asegurar que Convex esté completamente inicializado
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isLoaded && !isSignedIn) {
      setIsReady(false);
    }
  }, [isLoaded, isSignedIn]);

  return { isReady, isLoading: !isLoaded };
}
