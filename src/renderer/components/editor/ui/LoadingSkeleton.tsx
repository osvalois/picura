import React, { memo } from 'react';
import LoadingIndicator from './LoadingIndicator';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';

interface LoadingSkeletonProps {
  progress: number;
  currentEnergyMode: EnergyMode;
  onCancelLoading?: (() => void) | undefined;
}

/**
 * Componente avanzado de esqueleto de carga con animación progresiva
 * y feedback visual sobre el progreso de carga
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(({ 
  progress, 
  currentEnergyMode,
  onCancelLoading
}) => {
  // Configuración de skeleton
  const skeletonLineWidths = [
    '92%', '100%', '85%', '78%', '100%', '63%', '90%', '100%', '81%', '75%'
  ];
  
  const skeletonAnimationDelays = Array.from({ length: 10 }, (_, i) => `${i * 50}ms`);
  
  // Mensaje adaptativo según el progreso
  const loadingMessage = progress < 30 
    ? 'Cargando documento'
    : progress < 70 
      ? 'Procesando contenido' 
      : 'Preparando editor';
  
  return (
    <div className="editor-container min-h-[300px] bg-white dark:bg-gray-900 p-4 animate-fadeIn">
      {/* Barra de progreso */}
      <LoadingIndicator 
        progress={progress}
        message={loadingMessage}
      />

      <div className="select-none">
        {/* Skeleton para toolbar con degradado */}
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-md mb-6 shadow-sm"></div>

        {/* Skeleton para título de documento */}
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-2/5 mb-8"></div>

        {/* Skeleton para contenido con animación mejorada */}
        <div className="space-y-3 mb-8">
          {skeletonLineWidths.slice(0, 5).map((width, i) => (
            <div 
              key={`line-1-${i}`}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              style={{ 
                width, 
                animationDelay: skeletonAnimationDelays[i],
                opacity: progress > 20 ? 1 : 0.7,
                transition: 'opacity 0.5s ease'
              }}
            />
          ))}
        </div>

        {/* Segunda sección de skeletons con aparición progresiva */}
        <div className="space-y-3 mb-8">
          {skeletonLineWidths.slice(5, 8).map((width, i) => (
            <div 
              key={`line-2-${i}`}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              style={{ 
                width, 
                animationDelay: skeletonAnimationDelays[i + 5], 
                opacity: progress > 40 ? 1 : 0.5,
                transition: 'opacity 0.5s ease'
              }}
            />
          ))}
        </div>

        {/* Tercera sección - solo visible a mayor progreso */}
        <div className="space-y-3" style={{ opacity: progress > 60 ? 1 : 0.3, transition: 'opacity 0.8s ease' }}>
          {skeletonLineWidths.slice(8, 10).map((width, i) => (
            <div 
              key={`line-3-${i}`} 
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              style={{ width, animationDelay: skeletonAnimationDelays[i + 8] }}
            />
          ))}
        </div>
      </div>

      {/* Información de energía */}
      {(currentEnergyMode === 'ultraSaving' || currentEnergyMode === 'lowPower') && (
        <div className="absolute bottom-4 left-4 text-xs text-green-600 dark:text-green-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium">
            {currentEnergyMode === 'ultraSaving'
              ? 'Modo de ultraahorro activo'
              : 'Modo de ahorro activo'}
          </span>
        </div>
      )}

      {/* Botón de carga forzada con animación de aparición */}
      {progress > 15 && onCancelLoading && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onCancelLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 
                       transition-all duration-200 text-sm font-medium animate-fadeIn flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver contenido parcial
          </button>
        </div>
      )}
    </div>
  );
});

export default LoadingSkeleton;