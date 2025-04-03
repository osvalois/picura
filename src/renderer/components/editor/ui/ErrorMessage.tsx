import React, { memo } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Componente para mostrar mensajes de error con opción de reintentar
 */
const ErrorMessage: React.FC<ErrorMessageProps> = memo(({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-white dark:bg-gray-900 text-center p-6">
      <div className="max-w-md">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error al cargar documento</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 
                     transition-all duration-200 text-sm font-medium"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
});

export default ErrorMessage;