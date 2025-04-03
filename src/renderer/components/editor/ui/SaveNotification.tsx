import React, { memo } from 'react';

interface SaveNotificationProps {
  show: boolean;
  status?: 'success' | 'error' | 'saving';
}

/**
 * Componente para mostrar notificaciones de guardado con diferentes estados
 */
const SaveNotification: React.FC<SaveNotificationProps> = memo(({ show, status = 'success' }) => {
  const getNotificationClasses = () => {
    // Clases base
    let classes = 'absolute top-4 right-4 px-4 py-2 rounded-md shadow-md z-50 transition-all duration-300 flex items-center text-sm';
    
    // Añadir clases según estado
    if (status === 'success') {
      classes += ' bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/30 text-green-700 dark:text-green-300';
    } else if (status === 'error') {
      classes += ' bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/30 text-red-700 dark:text-red-300';
    } else {
      classes += ' bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/30 text-blue-700 dark:text-blue-300';
    }
    
    // Clase de visibilidad
    classes += show ? ' opacity-100 translate-y-0' : ' opacity-0 -translate-y-2 pointer-events-none';
    
    return classes;
  };
  
  const renderIcon = () => {
    if (status === 'success') {
      return (
        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (status === 'error') {
      return (
        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 mr-2 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
  };
  
  const getMessage = () => {
    if (status === 'success') return 'Documento guardado';
    if (status === 'error') return 'Error al guardar';
    return 'Guardando...';
  };

  return (
    <div className={getNotificationClasses()}>
      {renderIcon()}
      <span>{getMessage()}</span>
    </div>
  );
});

export default SaveNotification;