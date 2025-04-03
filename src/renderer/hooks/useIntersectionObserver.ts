import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  onVisibleCallback?: () => void;
}

/**
 * Hook optimizado para detectar cuando un elemento se vuelve visible en el viewport
 * Implementación robusta que evita ciclos de renderizado y fugas de memoria
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
  onVisibleCallback,
}: UseIntersectionObserverProps = {}): [React.RefCallback<Element>, boolean, IntersectionObserverEntry | null] {
  // Usamos refs para el estado interno para minimizar re-renderizados
  const nodeRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Mantenemos el estado de visibilidad y el entry como estado de React para poder devolver valores actualizados
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  
  // Refs para mantener estado sin causar re-renderizados
  const frozen = useRef<boolean>(false);
  const hasBeenVisible = useRef<boolean>(false);
  
  // Callback para manejar cambios de visibilidad 
  const handleIntersectionChange = useCallback((entries: IntersectionObserverEntry[]) => {
    const firstEntry = entries[0];
    if (!firstEntry) return;
    
    // Determinamos si es visible
    const isIntersecting = firstEntry.isIntersecting;
    
    // Early exit si ya está congelado y tenemos freezeOnceVisible habilitado
    if (frozen.current && freezeOnceVisible) {
      return;
    }
    
    // Optimizamos actualizaciones de estado - solo actualizamos cuando hay cambio real
    setIsVisible(prevVisible => {
      if (prevVisible !== isIntersecting) {
        setEntry(firstEntry);
        return isIntersecting;
      }
      return prevVisible;
    });
    
    // Si se vuelve visible
    if (isIntersecting) {
      // Marcamos que ha sido visible al menos una vez
      hasBeenVisible.current = true;
      
      // Si debe congelarse cuando es visible, actualizamos el estado
      if (freezeOnceVisible) {
        frozen.current = true;
      }
      
      // Ejecutamos callback si existe
      if (onVisibleCallback) {
        onVisibleCallback();
      }
    }
  }, [freezeOnceVisible, onVisibleCallback]);
  
  // Efecto para crear y limpiar el observer
  useEffect(() => {
    // Creamos un nuevo observer
    const observer = new IntersectionObserver(handleIntersectionChange, {
      threshold,
      root,
      rootMargin,
    });
    
    observerRef.current = observer;
    
    // Observamos el nodo actual si existe
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, root, rootMargin, handleIntersectionChange]);
  
  // Callback ref que se pasa al elemento a observar - memoizado con dependencias mínimas
  const setRef = useCallback((node: Element | null) => {
    // Si el nodo no ha cambiado, no hacemos nada
    if (node === nodeRef.current) return;
    
    // Si había un nodo previo, dejamos de observarlo
    if (nodeRef.current && observerRef.current) {
      observerRef.current.unobserve(nodeRef.current);
    }
    
    // Actualizamos la referencia
    nodeRef.current = node;
    
    // Si hay un nuevo nodo y un observer, empezamos a observarlo
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);
  
  return [setRef, isVisible, entry];
}