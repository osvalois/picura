import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EnergyMode, SustainabilityMetrics } from '../../../shared/types/SustainabilityMetrics';

interface SustainabilityIndicatorProps {
  metrics?: SustainabilityMetrics;
  mode?: string;
  onModeChange?: (mode: string) => void;
  showDetailed?: boolean;
  variant?: 'compact' | 'standard' | 'detailed';
  className?: string;
  energyMode?: EnergyMode;
  batteryLevel?: number;
  isCharging?: boolean;
}

/**
 * Componente para mostrar métricas de sostenibilidad
 * Optimizado para mostrar información relevante según modo de energía
 * Con interfaz interactiva para cambiar modos de energía
 */
const SustainabilityIndicator: React.FC<SustainabilityIndicatorProps> = ({
  metrics,
  mode,
  energyMode,
  onModeChange,
  showDetailed = false,
  variant = 'standard',
  className = '',
  batteryLevel,
  isCharging
}) => {
  // Estado para controlar apertura del panel de modos
  const [showModePanel, setShowModePanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Usar el modo proporcionado o energyMode como fallback
  const currentEnergyMode = mode || energyMode || 'standard';
  
  // Métricas por defecto cuando no se proporcionan
  const defaultMetrics: SustainabilityMetrics = {
    cpu: { current: 5, average: 10, peak: 15 },
    memory: { current: 8, average: 12, peak: 20 },
    disk: { reads: 1024, writes: 512 },
    network: { sent: 256, received: 1024 },
    battery: { 
      isCharging: isCharging !== undefined ? isCharging : true, 
      level: batteryLevel !== undefined ? batteryLevel : 80 
    },
    estimatedEnergy: { current: 500, total: 1200 },
  };
  
  // Manejador para cerrar panel al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowModePanel(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Alternar panel de modos
  const toggleModePanel = useCallback(() => {
    setShowModePanel(prev => !prev);
  }, []);
  
  // Cambiar modo de energía y cerrar panel
  const handleModeChange = useCallback((newMode: string) => {
    if (onModeChange) {
      onModeChange(newMode);
    }
    setShowModePanel(false);
  }, [onModeChange]);
  
  // Usar métricas proporcionadas o las predeterminadas
  const currentMetrics = metrics || defaultMetrics;
  // Calcula puntaje de sostenibilidad global (0-100)
  const calculateSustainabilityScore = (): number => {
    // Ponderación de factores
    const weights = {
      cpu: 0.4,
      memory: 0.3,
      battery: 0.2,
      network: 0.1
    };
    
    // Normaliza cada métrica al rango 0-100
    const cpuScore = 100 - Math.min(100, currentMetrics.cpu.current);
    const memoryScore = 100 - Math.min(100, currentMetrics.memory.current);
    
    // Puntaje de batería basado en nivel y estado de carga
    const batteryScore = currentMetrics.battery.isCharging 
      ? 80 // Si está cargando, puntuación base decente
      : Math.max(0, currentMetrics.battery.level - (currentMetrics.estimatedEnergy.current / 50));
    
    // Puntaje de red (menor uso = mejor puntuación)
    const networkUsage = currentMetrics.network.sent + currentMetrics.network.received;
    const networkScore = Math.max(0, 100 - (networkUsage / 1024 / 10));
    
    // Puntaje ponderado final
    const score = 
      cpuScore * weights.cpu +
      memoryScore * weights.memory +
      batteryScore * weights.battery +
      networkScore * weights.network;
    
    return Math.round(score);
  };
  
  // Calcula el color para el indicador basado en el puntaje
  const getIndicatorColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Obtiene el impacto estimado por hora
  const getHourlyImpact = (): string => {
    // Consumo estimado por hora en mWh
    const hourlyConsumption = currentMetrics.estimatedEnergy.current;
    
    if (hourlyConsumption < 500) return 'Mínimo';
    if (hourlyConsumption < 1000) return 'Bajo';
    if (hourlyConsumption < 2000) return 'Moderado';
    if (hourlyConsumption < 3000) return 'Alto';
    return 'Muy alto';
  };
  
  // Formatea un valor de bytes para mostrar
  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Calcula el puntaje
  const sustainabilityScore = calculateSustainabilityScore();
  const indicatorColor = getIndicatorColor(sustainabilityScore);
  
  // Renderizado del menú desplegable de modos de energía
  const renderEnergyModeMenu = () => {
    if (!showModePanel) return null;
    
    return (
      <div 
        ref={panelRef}
        className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 w-64 overflow-hidden"
      >
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Modo de energía</h4>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* Modo Alto Rendimiento */}
          <button 
            className={`w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${currentEnergyMode === 'highPerformance' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => handleModeChange('highPerformance')}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">Alto rendimiento</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Prioriza velocidad y rendimiento</div>
            </div>
            {currentEnergyMode === 'highPerformance' && (
              <div className="ml-auto">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          
          {/* Modo Estándar */}
          <button 
            className={`w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${currentEnergyMode === 'standard' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => handleModeChange('standard')}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">Estándar</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Balance entre rendimiento y eficiencia</div>
            </div>
            {currentEnergyMode === 'standard' && (
              <div className="ml-auto">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          
          {/* Modo Ahorro de Energía */}
          <button 
            className={`w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${currentEnergyMode === 'lowPower' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => handleModeChange('lowPower')}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7zM13 3v7h7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">Ahorro de energía</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Reduce consumo manteniendo funcionalidad</div>
            </div>
            {currentEnergyMode === 'lowPower' && (
              <div className="ml-auto">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          
          {/* Modo Ultra Ahorro */}
          <button 
            className={`w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${currentEnergyMode === 'ultraSaving' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => handleModeChange('ultraSaving')}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">Ultra ahorro</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Máxima eficiencia, prioriza autonomía</div>
            </div>
            {currentEnergyMode === 'ultraSaving' && (
              <div className="ml-auto">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
        
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Consumo actual: {Math.round(currentMetrics.estimatedEnergy.current)} mW
          </div>
        </div>
      </div>
    );
  };

  // Variante compacta - solo muestra un indicador de color
  if (variant === 'compact') {
    return (
      <div className={`sustainability-indicator-compact relative ${className}`}>
        <button 
          onClick={toggleModePanel}
          className="flex items-center space-x-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={`Impacto sostenible: ${sustainabilityScore}/100 - Haz clic para cambiar modo de energía`}
        >
          <div className={`w-3 h-3 rounded-full ${indicatorColor}`}></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {sustainabilityScore}
          </span>
        </button>
        {renderEnergyModeMenu()}
      </div>
    );
  }
  
  // Variante estándar - muestra un resumen conciso con menú desplegable
  if (variant === 'standard') {
    return (
      <div className={`sustainability-indicator-standard relative ${className}`}>
        <button 
          onClick={toggleModePanel}
          className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
          title="Haz clic para cambiar modo de energía"
        >
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${indicatorColor} mb-0.5`}></div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div 
                className={`absolute left-0 top-0 h-full ${indicatorColor} transition-all duration-500`}
                style={{ width: `${sustainabilityScore}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={`text-xs font-medium whitespace-nowrap
              ${currentEnergyMode === 'highPerformance' ? 'text-orange-500' : 
                currentEnergyMode === 'standard' ? 'text-blue-500' : 
                currentEnergyMode === 'lowPower' ? 'text-green-500' : 'text-green-700'}`}
            >
              {currentEnergyMode === 'highPerformance' ? 'Rendimiento' : 
               currentEnergyMode === 'standard' ? 'Estándar' : 
               currentEnergyMode === 'lowPower' ? 'Ahorro' : 'Ultra ahorro'}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-3.5 h-3.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d={currentMetrics.battery.isCharging 
                  ? "M13 10V3L4 14h7v7l9-11h-7z" 
                  : "M3 6h18v12H3V6zm6 10a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4z"} />
            </svg>
            <span className="whitespace-nowrap">
              {currentMetrics.battery.isCharging ? 'Cargando' : `${currentMetrics.battery.level}%`}
            </span>
          </div>
          
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {renderEnergyModeMenu()}
      </div>
    );
  }
  
  // Variante detallada - muestra métricas completas con diseño mejorado
  return (
    <div className={`sustainability-indicator-detailed relative ${className}`}>
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Panel de Sostenibilidad</h3>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 mr-2">
              <div className={`w-3.5 h-3.5 rounded-full ${indicatorColor}`}></div>
            </div>
            <span className="text-sm font-semibold">{sustainabilityScore}<span className="text-xs text-gray-500 dark:text-gray-400">/100</span></span>
          </div>
        </div>
        
        {/* Barra de progreso principal */}
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${indicatorColor} transition-all duration-700 ease-out`}
              style={{ width: `${sustainabilityScore}%` }}
            ></div>
          </div>
        </div>
        
        {/* Panel de métricas con diseño de tarjetas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <div className="flex mb-1">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">CPU</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-medium">{currentMetrics.cpu.current.toFixed(1)}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Pico: {currentMetrics.cpu.peak.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, currentMetrics.cpu.current)}%` }}></div>
            </div>
          </div>
          
          <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <div className="flex mb-1">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">Memoria</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-medium">{currentMetrics.memory.current.toFixed(1)}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Pico: {currentMetrics.memory.peak.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, currentMetrics.memory.current)}%` }}></div>
            </div>
          </div>
          
          <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <div className="flex mb-1">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">Energía</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-medium">{currentMetrics.estimatedEnergy.current.toFixed(0)} mW</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{getHourlyImpact()}</span>
            </div>
            <div className="w-full h-1 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${Math.min(100, currentMetrics.estimatedEnergy.current / 30)}%` }}></div>
            </div>
          </div>
          
          <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <div className="flex mb-1">
              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">Batería</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-medium">{currentMetrics.battery.level}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentMetrics.battery.isCharging ? 'Cargando' : 'Descargando'}
              </span>
            </div>
            <div className="w-full h-1 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${currentMetrics.battery.isCharging ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${currentMetrics.battery.level}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Panel de red */}
        <div className="mb-4 p-2 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <div className="flex mb-1">
            <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">Red</span>
          </div>
          <div className="flex justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-xs">{formatByteSize(currentMetrics.network.received)}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-xs">{formatByteSize(currentMetrics.network.sent)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selector de modo de energía */}
        <div className="relative">
          <div 
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors"
            onClick={toggleModePanel}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className={`w-4 h-4 mr-2 
                  ${currentEnergyMode === 'highPerformance' ? 'text-orange-500' : 
                    currentEnergyMode === 'standard' ? 'text-blue-500' : 
                    currentEnergyMode === 'lowPower' ? 'text-green-500' : 
                    'text-green-700'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={currentEnergyMode === 'highPerformance' 
                      ? "M13 10V3L4 14h7v7l9-11h-7z" 
                      : currentEnergyMode === 'standard'
                      ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      : currentEnergyMode === 'lowPower'
                      ? "M13 10V3L4 14h7v7l9-11h-7zM13 3v7h7z"
                      : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"} 
                  />
                </svg>
                <span className="text-sm font-medium">{currentEnergyMode === 'highPerformance' ? 'Alto rendimiento' : 
                  currentEnergyMode === 'standard' ? 'Modo estándar' : 
                  currentEnergyMode === 'lowPower' ? 'Ahorro de energía' : 
                  'Ultra ahorro'}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {renderEnergyModeMenu()}
        </div>
        
        {/* Resumen de impacto */}
        <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center space-x-1">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Total energía: {(currentMetrics.estimatedEnergy.total / 1000).toFixed(2)} Wh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityIndicator;