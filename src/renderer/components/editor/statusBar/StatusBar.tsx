import React, { useState, useEffect } from 'react';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { useSustainabilityContext } from '../../../contexts/SustainabilityContext';
import EnergyModeSelector from '../../common/EnergyModeSelector';

interface StatusBarProps {
  // Estadísticas básicas
  wordCount: number;
  selectionStats: {
    characters: number;
    words: number;
    lines: number;
  };
  // Información de sostenibilidad
  energyMode: EnergyMode;
  sustainabilityMetrics?: {
    storageSize: number;
    optimizationLevel: number;
    compressionRatio: number;
    cpu?: {
      usage: number;
      cores: number;
    };
    memory?: {
      usagePercent: number;
      usageRaw: number;
      total: number;
    };
    battery?: {
      level: number;
      isCharging: boolean;
    };
    energyImpact?: {
      current: number;
      average: number;
    };
  };
  showEnergyMetrics: boolean;
}

/**
 * Barra de estado con métricas de documento y sostenibilidad
 */
const StatusBar: React.FC<StatusBarProps> = ({
  wordCount,
  selectionStats,
  energyMode,
  sustainabilityMetrics,
  showEnergyMetrics
}) => {
  const { setEnergyMode } = useSustainabilityContext();
  const [showEnergySelector, setShowEnergySelector] = useState(false);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  
  // Efecto para animar las métricas en cambios
  useEffect(() => {
    if (sustainabilityMetrics) {
      setAnimateMetrics(true);
      const timer = setTimeout(() => setAnimateMetrics(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [sustainabilityMetrics?.cpu?.usage, sustainabilityMetrics?.memory?.usagePercent]);
  
  // Maneja el cambio de modo de energía
  const handleEnergyModeChange = async (mode: EnergyMode) => {
    try {
      await setEnergyMode(mode);
      setShowEnergySelector(false);
    } catch (error) {
      console.error('Error al cambiar el modo de energía:', error);
    }
  };
  
  // Formatea valor con 1 decimal
  const formatValue = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toFixed(1);
  };
  
  // Formatea tamaño para mostrar
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Determina nivel de impacto energético
  const getEnergyLevel = () => {
    if (!sustainabilityMetrics?.energyImpact?.current) return 'good';
    const level = sustainabilityMetrics.energyImpact.current;
    if (level > 70) return 'high';
    if (level > 40) return 'moderate';
    return 'good';
  };
  
  const energyLevel = getEnergyLevel();
  
  // Genera descripción del modo de energía
  const getEnergyModeDescription = (mode: EnergyMode): string => {
    switch (mode) {
      case 'highPerformance':
        return 'Alto rendimiento';
      case 'standard':
        return 'Equilibrado';
      case 'lowPower':
        return 'Ahorro de energía';
      case 'ultraSaving':
        return 'Ahorro máximo';
      default:
        return 'Estándar';
    }
  };
  
  // Genera color para el modo de energía
  const getEnergyModeColor = (mode: EnergyMode): string => {
    switch (mode) {
      case 'highPerformance':
        return 'text-purple-600 dark:text-purple-400';
      case 'standard':
        return 'text-blue-600 dark:text-blue-400';
      case 'lowPower':
        return 'text-green-600 dark:text-green-400';
      case 'ultraSaving':
        return 'text-green-700 dark:text-green-300';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  // Genera indicador de optimización
  const getOptimizationIndicator = (level: number): JSX.Element => {
    let color = 'bg-yellow-500';
    
    if (level >= 95) {
      color = 'bg-green-500';
    } else if (level >= 80) {
      color = 'bg-green-400';
    } else if (level >= 60) {
      color = 'bg-yellow-400';
    } else if (level < 60) {
      color = 'bg-red-500';
    }
    
    return (
      <div className="flex items-center space-x-1" title={`Nivel de optimización: ${level.toFixed(0)}%`}>
        <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-300`} 
            style={{ width: `${Math.min(100, level)}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{level.toFixed(0)}%</span>
      </div>
    );
  };
  
  // Obtiene el ícono según el nivel de energía
  const getEnergyLevelIcon = () => {
    if (energyLevel === 'good') {
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (energyLevel === 'moderate') {
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
  };
  
  // Clases de animación para métricas
  const getAnimationClass = () => animateMetrics ? 'transition-all duration-300 ease-in-out' : '';
  
  return (
    <div className="status-bar flex flex-wrap md:flex-nowrap items-center justify-between md:justify-start">
      <div className="document-stats flex items-center px-2 py-1 bg-gray-100/50 dark:bg-gray-800/30 rounded-md mr-2 mb-1 md:mb-0">
        <svg className="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="font-medium">{wordCount.toLocaleString()}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">palabras</span>
      </div>
      
      {selectionStats.characters > 0 && (
        <div className="selection-stats flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md mr-2 mb-1 md:mb-0">
          <svg className="w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className={`font-medium ${getAnimationClass()}`}>{selectionStats.characters}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1 mr-2">car</span>
          <span className={`font-medium ${getAnimationClass()}`}>{selectionStats.words}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1 mr-2">pal</span>
          <span className={`font-medium ${getAnimationClass()}`}>{selectionStats.lines}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">lín</span>
        </div>
      )}
      
      <div className="flex-grow hidden md:block" />
      
      {showEnergyMetrics && sustainabilityMetrics && (
        <div className="energy-metrics flex-wrap md:flex-nowrap flex items-center space-x-0 md:space-x-2 mb-1 md:mb-0">
          <div className="cpu flex items-center text-gray-600 dark:text-gray-300 px-2 py-1 bg-gray-50 dark:bg-gray-800/40 rounded-md mr-2 mb-1 md:mb-0">
            <svg className="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className={`font-medium ${getAnimationClass()}`}>
              {formatValue(sustainabilityMetrics.cpu?.usage)}%
            </span>
          </div>
          
          <div className="memory flex items-center text-gray-600 dark:text-gray-300 px-2 py-1 bg-gray-50 dark:bg-gray-800/40 rounded-md mr-2 mb-1 md:mb-0">
            <svg className="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className={`font-medium ${getAnimationClass()}`}>
              {formatValue(sustainabilityMetrics.memory?.usagePercent)}%
            </span>
          </div>
          
          <div className="energy-impact flex items-center mb-1 md:mb-0">
            <div className={`sustainability-indicator ${energyLevel} ${getAnimationClass()}`}>
              {getEnergyLevelIcon()}
              <span className="mr-1 hidden md:inline">
                {energyLevel === 'good' ? 'Bajo impacto' : 
                 energyLevel === 'moderate' ? 'Impacto medio' : 
                 'Alto impacto'}
              </span>
              <span className="inline md:hidden mr-1">Impacto</span>
              <span className="font-medium">
                {formatValue(sustainabilityMetrics.energyImpact?.current)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="energy-mode flex items-center ml-0 md:ml-2 px-2 py-1 bg-gray-50 dark:bg-gray-800/40 rounded-md">
        <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={() => setShowEnergySelector(!showEnergySelector)}>
          {energyMode === 'highPerformance' ? (
            <svg className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ) : energyMode === 'standard' ? (
            <svg className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : energyMode === 'lowPower' ? (
            <svg className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 mr-1 text-green-700 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          <span className={`font-medium ${
            energyMode === 'highPerformance' ? 'text-purple-600 dark:text-purple-400' : 
            energyMode === 'standard' ? 'text-blue-600 dark:text-blue-400' : 
            energyMode === 'lowPower' ? 'text-green-600 dark:text-green-400' : 
            'text-green-700 dark:text-green-500'
          }`}>
            {getEnergyModeDescription(energyMode)}
          </span>
        </div>
        
        {showEnergySelector && (
          <div className="absolute right-2 bottom-9 z-50">
            <EnergyModeSelector 
              currentMode={energyMode} 
              onChange={handleEnergyModeChange} 
              batteryLevel={sustainabilityMetrics?.battery?.level} 
              isCharging={sustainabilityMetrics?.battery?.isCharging} 
              compact={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;