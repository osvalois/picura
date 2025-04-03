import { useState, useCallback, useRef, useEffect } from 'react';
import { isSafeUrl } from '../utils/safeContent';

interface UseInteractivityProps {
  content: string;
  enableLinks?: boolean;
  onLinkClick?: (url: string, event: React.MouseEvent) => void;
  onImageLoad?: (url: string, dimensions: { width: number; height: number }) => void;
  onCodeCopy?: (code: string) => void;
  maxZoomLevel?: number;
}

interface UseInteractivityResult {
  activeElementId: string | null;
  zoomLevel: number;
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  handleImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  handleCopyCode: (code: string) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Hook para gestionar la interactividad del visor (links, imágenes, etc.)
 */
export function useInteractivity({
  content,
  enableLinks = true,
  onLinkClick,
  onImageLoad,
  onCodeCopy,
  maxZoomLevel = 3
}: UseInteractivityProps): UseInteractivityResult {
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Referencias para el contenedor principal
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Maneja clics en enlaces
  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute('href');
      
      if (!href) return;
      
      // Maneja los enlaces internos por fragmento
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          setActiveElementId(targetId);
        }
        return;
      }
      
      // Comprueba si la URL es segura
      if (!enableLinks || !isSafeUrl(href)) {
        e.preventDefault();
        return;
      }
      
      // Callback personalizado para enlaces
      if (onLinkClick) {
        e.preventDefault();
        onLinkClick(href, e);
      }
    },
    [enableLinks, onLinkClick]
  );

  // Maneja clics en imágenes
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const imageUrl = e.currentTarget.getAttribute('src');
      if (!imageUrl) return;
      
      // Alterna el zoom al hacer clic en una imagen
      if (zoomLevel > 1) {
        setZoomLevel(1);
      } else {
        setZoomLevel(1.5);
      }
    },
    [zoomLevel]
  );

  // Maneja la copia de bloques de código
  const handleCopyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code)
        .then(() => {
          if (onCodeCopy) {
            onCodeCopy(code);
          }
        })
        .catch(err => {
          console.error('Error al copiar el código:', err);
        });
    },
    [onCodeCopy]
  );

  // Funciones de zoom
  const increaseZoom = useCallback(() => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, maxZoomLevel));
  }, [maxZoomLevel]);

  const decreaseZoom = useCallback(() => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Maneja eventos de teclado globales
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Zoom con teclado (Ctrl + / Ctrl -)
    if (e.ctrlKey) {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        increaseZoom();
      } else if (e.key === '-') {
        e.preventDefault();
        decreaseZoom();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    }
  }, [increaseZoom, decreaseZoom, resetZoom]);

  // Detecta y monitoriza imágenes para eventos de carga
  useEffect(() => {
    const handleImageLoaded = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (img && img.src && onImageLoad) {
        onImageLoad(img.src, {
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      }
    };

    // Cuando el contenido cambia, agregamos listeners a las nuevas imágenes
    return () => {
      const images = containerRef.current?.querySelectorAll('img');
      if (images) {
        images.forEach(img => {
          img.removeEventListener('load', handleImageLoaded);
        });
      }
    };
  }, [content, onImageLoad]);

  return {
    activeElementId,
    zoomLevel,
    handleLinkClick,
    handleImageClick,
    handleCopyCode,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    handleKeyDown
  };
}