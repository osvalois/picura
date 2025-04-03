import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ViewerSettings } from '../utils/viewerConfig';

interface MermaidRendererProps {
  content: string;
  settings: ViewerSettings;
  className?: string;
}

/**
 * Componente para renderizar diagramas Mermaid
 */
const MermaidRenderer: React.FC<MermaidRendererProps> = ({
  content,
  settings,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Inicializa y configura Mermaid.js
  useEffect(() => {
    const isDarkTheme = settings.theme.colors.background.includes('#0d') || settings.theme.colors.background.includes('rgb(13');
    
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkTheme ? 'dark' : 'default',
      securityLevel: 'strict', // Configuración de seguridad estricta
      fontFamily: settings.theme.typography.fontFamily
    });
  }, [settings.theme]);

  // Renderiza el diagrama
  useEffect(() => {
    if (!containerRef.current) return;
    
    setIsLoading(true);
    setRenderError(null);
    
    const container = containerRef.current;
    
    try {
      // Limpiar el contenedor
      container.innerHTML = '';
      
      // Crear div para el diagrama
      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'mermaid';
      diagramDiv.textContent = content;
      
      container.appendChild(diagramDiv);
      
      // Renderizar el diagrama
      mermaid.init(undefined, '.mermaid', (svgCode: string) => {
        if (container.querySelector('.mermaid')) {
          container.querySelector('.mermaid')!.innerHTML = svgCode;
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error rendering Mermaid diagram:', error);
      setRenderError((error as Error).message || 'Error al renderizar el diagrama');
      setIsLoading(false);
    }
  }, [content]);

  // Estilo personalizado basado en los ajustes del tema
  const customStyle = `
    .mermaid {
      font-family: ${settings.theme.typography.fontFamily};
      background-color: ${settings.theme.colors.background};
      color: ${settings.theme.colors.text};
      text-align: center;
      max-width: 100%;
      overflow-x: auto;
      padding: 1rem;
    }
    
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  `;

  return (
    <div className={`mermaid-renderer ${className}`}>
      <style>{customStyle}</style>
      
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {renderError && (
        <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="font-bold">Error al renderizar el diagrama:</p>
          <p className="font-mono text-sm mt-2">{renderError}</p>
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
            <pre><code>{content}</code></pre>
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="w-full overflow-x-auto"></div>
    </div>
  );
};

export default MermaidRenderer;