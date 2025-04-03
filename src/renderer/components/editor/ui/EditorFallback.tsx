import React, { memo } from 'react';

/**
 * Componente que muestra un esqueleto para representar el editor mientras carga
 */
const EditorFallback: React.FC = memo(() => {
  const fallbackLineWidths = [
    '75%', '100%', '83%', '91%', '67%', '95%', '80%', '100%', '87%'
  ];
  
  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="animate-pulse select-none">
        {/* Skeleton para la barra de herramientas con degradado para mejor apariencia */}
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-md mb-6 shadow-sm flex items-center px-3">
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-md ml-2"></div>
          <div className="flex-grow"></div>
          <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>

        {/* Skeleton para el título del documento */}
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-2/5 mb-6"></div>

        {/* Skeleton para el contenido del editor - primera sección */}
        <div className="space-y-2.5">
          {fallbackLineWidths.slice(0, 5).map((width, i) => (
            <div 
              key={`line-1-${i}`} 
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              style={{ 
                width, 
                willChange: 'opacity, transform',
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>

        {/* Segunda sección con un pequeño espacio */}
        <div className="mt-8 space-y-2.5">
          {fallbackLineWidths.slice(5).map((width, i) => (
            <div 
              key={`line-2-${i}`} 
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              style={{ 
                width, 
                willChange: 'opacity, transform',
                animationDelay: `${(i + 5) * 50}ms`,
              }}
            />
          ))}
        </div>
        
        {/* Mensaje de carga para dar feedback */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Preparando editor...
          </div>
        </div>
      </div>
    </div>
  );
});

export default EditorFallback;