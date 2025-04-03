import React, { useState } from 'react';
import { ViewerSettings } from '../utils/viewerConfig';

interface ViewerToolbarProps {
  title?: string | undefined;
  filename?: string | undefined;
  settings: ViewerSettings;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleTheme: () => void;
  onSettingsChange: (newSettings: Partial<ViewerSettings>) => void;
  className?: string;
}

/**
 * Barra de herramientas para el visor de documentos
 */
const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  title,
  filename,
  settings,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleTheme,
  onSettingsChange,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Determina si el tema actual es oscuro
  const isDarkTheme = settings.theme.colors.background.includes('#0d') || settings.theme.colors.background.includes('rgb(13');
  
  // Formatea el nivel de zoom para mostrarlo
  const formattedZoom = `${Math.round(zoomLevel * 100)}%`;
  
  return (
    <div className={`viewer-toolbar flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Título y nombre de archivo */}
      <div className="flex items-center">
        <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 mr-2 truncate max-w-xs">
          {title || filename || 'Documento sin título'}
        </h2>
        {filename && title && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {filename}
          </span>
        )}
      </div>
      
      {/* Controles */}
      <div className="flex items-center space-x-2">
        {/* Controles de zoom */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md">
          <button
            onClick={onZoomOut}
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-md"
            aria-label="Reducir zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          
          <span className="px-2 text-xs text-gray-600 dark:text-gray-300 select-none">
            {formattedZoom}
          </span>
          
          <button
            onClick={onZoomIn}
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Aumentar zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          
          <button
            onClick={onZoomReset}
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-md"
            aria-label="Restablecer zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
        
        {/* Botón de alternar tema */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          aria-label={isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {isDarkTheme ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
        
        {/* Botón de configuración */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            aria-label="Configuración"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Panel de configuración */}
          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Configuración de visualización
                </h3>
                
                <div className="space-y-3">
                  {/* Mostrar números de línea */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="line-numbers" className="text-xs text-gray-600 dark:text-gray-400">
                      Números de línea en código
                    </label>
                    <input
                      id="line-numbers"
                      type="checkbox"
                      checked={settings.showLineNumbers}
                      onChange={(e) => onSettingsChange({ showLineNumbers: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Habilitar diagramas Mermaid */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="mermaid-diagrams" className="text-xs text-gray-600 dark:text-gray-400">
                      Diagramas Mermaid
                    </label>
                    <input
                      id="mermaid-diagrams"
                      type="checkbox"
                      checked={settings.enableMermaidDiagrams}
                      onChange={(e) => onSettingsChange({ enableMermaidDiagrams: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Habilitar fórmulas matemáticas */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="math-rendering" className="text-xs text-gray-600 dark:text-gray-400">
                      Fórmulas matemáticas
                    </label>
                    <input
                      id="math-rendering"
                      type="checkbox"
                      checked={settings.enableMathRendering}
                      onChange={(e) => onSettingsChange({ enableMathRendering: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Habilitar resaltado de sintaxis */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="syntax-highlighting" className="text-xs text-gray-600 dark:text-gray-400">
                      Resaltado de sintaxis
                    </label>
                    <input
                      id="syntax-highlighting"
                      type="checkbox"
                      checked={settings.enableSyntaxHighlighting}
                      onChange={(e) => onSettingsChange({ enableSyntaxHighlighting: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Tamaño de fuente relativo */}
                  <div>
                    <label htmlFor="font-size" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                      Tamaño de texto
                    </label>
                    <input
                      id="font-size"
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={settings.theme.typography.fontSizeFactor}
                      onChange={(e) => onSettingsChange({
                        theme: {
                          ...settings.theme,
                          typography: {
                            ...settings.theme.typography,
                            fontSizeFactor: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>A</span>
                      <span>A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerToolbar;