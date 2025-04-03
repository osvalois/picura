import React, { useEffect, useState } from 'react';

interface ViewerNotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Componente para mostrar notificaciones en el visor
 */
const ViewerNotification: React.FC<ViewerNotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  interface NotificationStyle {
    containerClass: string;
    iconClass: string;
    icon: React.ReactNode;
  }

  // Configura el estilo basado en el tipo de notificación
  const getStyles = (): NotificationStyle => {
    switch (type) {
      case 'success':
        return {
          containerClass: 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700',
          iconClass: 'text-green-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-700',
          iconClass: 'text-yellow-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )
        };
      case 'error':
        return {
          containerClass: 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-700',
          iconClass: 'text-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          containerClass: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700',
          iconClass: 'text-blue-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          )
        };
    }
  };
  
  const { containerClass, iconClass, icon } = getStyles();
  
  // Efecto para ocultar la notificación después del tiempo especificado
  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Guardamos referencia al timer de salida para poder limpiarlo
        dismissTimer = setTimeout(() => {
          onDismiss && onDismiss();
        }, 300); // Permitir que la animación de salida se complete
      }, duration);
      
      return () => {
        clearTimeout(timer);
        if (dismissTimer) clearTimeout(dismissTimer);
      };
    }
    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss, isVisible]);
  
  // Manejador para cerrar la notificación manualmente
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss && onDismiss();
    }, 300);
  };
  
  return (
    <div
      className={`fixed top-4 right-4 max-w-sm border-l-4 rounded-md shadow-md px-4 py-3 flex items-start z-50 transition-all duration-300 ${containerClass} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className={`mr-3 mt-0.5 ${iconClass}`}>
        {icon}
      </div>
      
      <div className="flex-1 mr-4">
        <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
      </div>
      
      <button
        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        onClick={handleDismiss}
        aria-label="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ViewerNotification;