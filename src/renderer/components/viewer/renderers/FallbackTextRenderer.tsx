import React from 'react';
import { ViewerSettings } from '../utils/viewerConfig';

interface FallbackTextRendererProps {
  content: string;
  settings: ViewerSettings;
  title?: string;
  error?: Error | null;
  className?: string;
}

/**
 * Renderizador de respaldo que muestra texto plano cuando otros renderizadores fallan
 */
const FallbackTextRenderer: React.FC<FallbackTextRendererProps> = ({
  content,
  settings,
  title,
  error,
  className = ''
}) => {
  return (
    <div className={`fallback-renderer ${className}`}>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">
            {title || 'Error al renderizar contenido'}
          </h3>
          <p className="mb-2">
            {error.message || 'Error desconocido al procesar este contenido'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando contenido en formato de texto plano.
          </p>
        </div>
      )}
      
      <div 
        className="p-4 bg-white dark:bg-gray-800 rounded-md overflow-auto"
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          color: settings.theme.colors.text
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default FallbackTextRenderer;