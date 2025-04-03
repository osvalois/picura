import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { ViewerSettings } from '../utils/viewerConfig';

interface MermaidRendererProps {
  content: string;
  settings: ViewerSettings;
  className?: string;
  onRenderComplete?: () => void;
  onRenderError?: (error: string) => void;
}

/**
 * Componente para renderizar diagramas Mermaid con manejo mejorado de errores
 * y configuración robusta.
 */
const MermaidRenderer: React.FC<MermaidRendererProps> = ({
                                                           content,
                                                           settings,
                                                           className = '',
                                                           onRenderComplete,
                                                           onRenderError
                                                         }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const contentRef = useRef<string>(content);
  const MAX_RENDER_ATTEMPTS = 2;

  // Actualizar la referencia cuando cambia el contenido
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Inicializa y configura Mermaid.js con manejo de errores
  useEffect(() => {
    try {
      const isDarkTheme = typeof settings.theme.colors.background === 'string' &&
          (settings.theme.colors.background.includes('#0d') ||
              settings.theme.colors.background.includes('rgb(13'));

      const fontFamily = settings.theme?.typography?.fontFamily || 'sans-serif';

      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkTheme ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: fontFamily,
        logLevel: 4, // Error
        errorOutputFormat: 'html'
      });
    } catch (error) {
      console.error('Error initializing Mermaid:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al inicializar';
      setRenderError(errorMessage);
      if (onRenderError) onRenderError(errorMessage);
    }
  }, [settings.theme, onRenderError]);

  // Función de renderizado encapsulada para reutilización
  const renderDiagram = useCallback(async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setRenderError(null);

    const container = containerRef.current;

    try {
      // Validar el contenido antes de renderizar
      if (!contentRef.current || contentRef.current.trim() === '') {
        throw new Error('El contenido del diagrama está vacío');
      }

      // Limpiar el contenedor antes de renderizar
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Crear div para el diagrama
      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'mermaid';
      diagramDiv.textContent = contentRef.current;

      container.appendChild(diagramDiv);

      // Usar mermaid.parse para validar primero la sintaxis
      await mermaid.parse(contentRef.current);

      // Renderizar con manejo de promesas
      let svg: any;
      ({svg} = await mermaid.render(`mermaid-diagram-${Date.now()}`, contentRef.current));

      if (container.querySelector('.mermaid')) {
        container.querySelector('.mermaid')!.innerHTML = svg;

        // Agregar atributos para accesibilidad
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          svgElement.setAttribute('aria-label', 'Diagrama Mermaid');
          svgElement.setAttribute('role', 'img');
        }
      }

      setIsLoading(false);
      if (onRenderComplete) onRenderComplete();

    } catch (error) {
      console.error('Error rendering Mermaid diagram:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al renderizar';
      setRenderError(errorMessage);
      setIsLoading(false);

      if (onRenderError) onRenderError(errorMessage);

      // Intentar nuevamente con un enfoque alternativo si falló menos de MAX_RENDER_ATTEMPTS
      if (renderAttempts < MAX_RENDER_ATTEMPTS) {
        setRenderAttempts(prev => prev + 1);
        setTimeout(() => {
              try {
                // Intento alternativo usando el método legacy
                mermaid.init(undefined, container.querySelector('.mermaid'));
                setRenderError(null);
                setIsLoading(false);
                if (onRenderComplete) onRenderComplete();
              } catch (fallbackError) {
                console.error('Fallback render attempt failed:', fallbackError);
                const fallbackErrorMessage = (fallbackError instanceof Error) ?
                    fallbackError.message : 'Error en el intento de renderizado alternativo';
                setRenderError(fallbackErrorMessage);
                if (onRenderError) onRenderError(fallbackErrorMessage);
              }
            },
            100);
      }
    }
  }, [onRenderComplete, onRenderError, renderAttempts]);

  // Renderiza el diagrama cuando cambia el contenido o configuración
  useEffect(() => {
    setRenderAttempts(0);
    renderDiagram();

    // Limpieza al desmontar
    return () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [content, renderDiagram]);

  // Manejo de cambios de tamaño para diagramas responsivos
  useEffect(() => {
    const handleResize = () => {
      if (!isLoading && !renderError && containerRef.current) {
        // Solo volver a renderizar si ha pasado tiempo suficiente desde el último resize
        renderDiagram();
      }
    };

    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [isLoading, renderError, renderDiagram]);

  // Función debounce para optimizar eventos frecuentes
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Verifica que las propiedades de settings existan para evitar errores
  const safeBackground = settings?.theme?.colors?.background || '#ffffff';
  const safeTextColor = settings?.theme?.colors?.text || '#000000';
  const safeFontFamily = settings?.theme?.typography?.fontFamily || 'sans-serif';

  // Estilo personalizado con manejo de valores undefined
  const customStyle = `
    .mermaid-renderer {
      width: 100%;
      position: relative;
    }
    
    .mermaid {
      font-family: ${safeFontFamily};
      background-color: ${safeBackground};
      color: ${safeTextColor};
      text-align: center;
      max-width: 100%;
      overflow-x: auto;
      padding: 1rem;
    }
    
    .mermaid svg {
      max-width: 100%;
      height: auto;
      display: inline-block;
    }
    
    .mermaid-error-details {
      margin-top: 8px;
      max-height: 200px;
      overflow-y: auto;
    }
  `;

  return (
      <div className={`mermaid-renderer ${className}`} data-testid="mermaid-container">
        <style>{customStyle}</style>

        {isLoading && (
            <div className="flex justify-center items-center p-4" aria-live="polite" aria-busy="true">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="sr-only">Cargando diagrama...</span>
            </div>
        )}

        {renderError && (
            <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-md" role="alert" aria-live="assertive">
              <p className="font-bold">Error al renderizar el diagrama:</p>
              <p className="font-mono text-sm mt-2">{renderError}</p>
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto mermaid-error-details">
                <pre><code>{content}</code></pre>
              </div>
              <button
                  onClick={() => renderDiagram()}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  disabled={isLoading}
              >
                Reintentar
              </button>
            </div>
        )}

        <div
            ref={containerRef}
            className="w-full overflow-x-auto"
            aria-hidden={!!renderError || isLoading}
        ></div>
      </div>
  );
};

export default MermaidRenderer;