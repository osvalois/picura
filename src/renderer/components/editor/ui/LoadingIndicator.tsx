import React, { memo } from 'react';

interface LoadingIndicatorProps {
  progress: number;
  message: string;
}

/**
 * Componente para mostrar el progreso de carga con una animación suave
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(({ progress, message }) => (
  <div className="fixed top-0 left-0 right-0 z-20 flex flex-col items-center">
    {/* Barra de progreso con transición suave */}
    <div className="w-full h-0.5 bg-blue-100 dark:bg-blue-900/30">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
    
    {/* Notificación flotante - usa clases en lugar de estilos inline para mejor rendimiento */}
    <div 
      className={`absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 
                 dark:border-gray-700 rounded-md shadow-lg px-3 py-2 text-sm transform 
                 transition-all duration-300 ease-out-cubic ${progress < 100 ? 'opacity-100' : 'opacity-0 -translate-y-2'}`}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
        <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {message} {progress > 0 ? `(${progress}%)` : ''}
        </span>
      </div>
    </div>
  </div>
));

export default LoadingIndicator;