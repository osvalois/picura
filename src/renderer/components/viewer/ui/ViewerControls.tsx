import React from 'react';

interface ViewerControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFullscreen?: () => void;
  onSearch?: () => void;
  onPrint?: () => void;
  className?: string;
}

/**
 * Controles flotantes para el visor
 */
const ViewerControls: React.FC<ViewerControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFullscreen,
  onSearch,
  onPrint,
  className = ''
}) => {
  // Formatea el nivel de zoom para mostrarlo
  const formattedZoom = `${Math.round(zoomLevel * 100)}%`;
  
  return (
    <div className={`viewer-controls fixed right-4 bottom-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* Botón de búsqueda */}
      {onSearch && (
        <button
          onClick={onSearch}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          title="Buscar en el documento (Ctrl+F)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      )}
      
      {/* Control de zoom */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center w-full"
          title="Aumentar zoom (Ctrl+)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        
        <div className="p-2 text-xs text-center font-medium text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
          {formattedZoom}
        </div>
        
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center w-full border-t border-gray-200 dark:border-gray-700"
          title="Reducir zoom (Ctrl-)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
        
        <button
          onClick={onZoomReset}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center w-full border-t border-gray-200 dark:border-gray-700"
          title="Restablecer zoom (Ctrl+0)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
      
      {/* Botones adicionales */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        {/* Botón de pantalla completa */}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            title="Pantalla completa (F11)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m9 0v4.5m0-4.5h4.5m0 9v4.5m0-4.5h-4.5m-9 0v4.5m0-4.5H3.75" />
            </svg>
          </button>
        )}
        
        {/* Botón de imprimir */}
        {onPrint && (
          <button
            onClick={onPrint}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center border-t border-gray-200 dark:border-gray-700"
            title="Imprimir (Ctrl+P)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewerControls;