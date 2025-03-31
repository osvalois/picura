import React, { useState, useEffect } from 'react';
import { EnergyMode } from '../../../shared/types/SustainabilityMetrics';
import { ENERGY_MODE_CONFIGS } from '../../../config/defaults';

interface EnergyModeSelectorProps {
  currentMode: EnergyMode;
  onChange: (mode: EnergyMode) => void;
  batteryLevel?: number;
  isCharging?: boolean;
  className?: string;
  compact?: boolean;
  showFeedback?: boolean;
}

/**
 * Selector de modo de energía con optimizaciones para UX
 * Permite al usuario configurar el comportamiento energético de la aplicación
 */
const EnergyModeSelector: React.FC<EnergyModeSelectorProps> = ({
  currentMode,
  onChange,
  batteryLevel,
  isCharging,
  className = '',
  compact = false,
  showFeedback = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EnergyMode>(currentMode);
  
  // Efecto para mostrar/ocultar feedback de cambio
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);
  
  // Definición de modos de energía
  const energyModes: {
    id: EnergyMode;
    label: string;
    description: string;
    color: string;
    icon: React.ReactNode;
    recommendedWhen: string;
  }[] = [
    {
      id: 'highPerformance',
      label: 'Alto rendimiento',
      description: 'Máximo rendimiento sin restricciones de energía',
      color: 'text-orange-500 border-orange-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      recommendedWhen: 'Conectado a la corriente con tareas intensivas'
    },
    {
      id: 'standard',
      label: 'Estándar',
      description: 'Balance entre rendimiento y consumo energético',
      color: 'text-blue-500 border-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      recommendedWhen: 'Uso diario normal'
    },
    {
      id: 'lowPower',
      label: 'Ahorro de energía',
      description: 'Reduce el consumo de energía manteniendo funcionalidad esencial',
      color: 'text-green-500 border-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      recommendedWhen: 'Batería baja o sesión prolongada'
    },
    {
      id: 'ultraSaving',
      label: 'Ultra ahorro',
      description: 'Máximo ahorro de energía con funcionalidad reducida',
      color: 'text-green-700 border-green-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      recommendedWhen: 'Batería crítica o máxima autonomía'
    }
  ];
  
  // Encuentra el modo actual
  const currentModeData = energyModes.find(mode => mode.id === currentMode) || energyModes[1];
  
  // Determina si debe mostrar sugerencia basada en batería
  const shouldShowBatteryWarning = 
    batteryLevel !== undefined && 
    !isCharging && 
    batteryLevel < 30 && 
    currentMode !== 'lowPower' && 
    currentMode !== 'ultraSaving';
  
  // Determina si debe mostrar sugerencia de modo ultra ahorro
  const shouldShowUltraSavingWarning = 
    batteryLevel !== undefined && 
    !isCharging && 
    batteryLevel < 15 && 
    currentMode !== 'ultraSaving';
  
  // Maneja la selección de modo con feedback
  const handleModeSelect = async (mode: EnergyMode) => {
    // Actualiza estado local inmediatamente para feedback visual
    setSelectedMode(mode);
    
    // Cierra el menú
    setIsOpen(false);
    
    // Llamada a la API para cambiar el modo
    await onChange(mode);
    
    // Muestra confirmación si está habilitada
    if (showFeedback) {
      setShowConfirmation(true);
    }
  };
  
  // Variante compacta
  if (compact) {
    return (
      <div className={`energy-mode-selector-compact relative ${className}`}>
        <button 
          className={`p-2 rounded-lg border shadow-sm ${
            currentMode === 'highPerformance' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/30' : 
            currentMode === 'standard' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30' : 
            currentMode === 'lowPower' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30' : 
            'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800/40'
          } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
          onClick={() => setIsOpen(!isOpen)}
          title={`Modo: ${currentModeData.label}`}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${
              currentMode === 'highPerformance' ? 'text-orange-700 dark:text-orange-400' : 
              currentMode === 'standard' ? 'text-blue-700 dark:text-blue-400' : 
              currentMode === 'lowPower' ? 'text-green-700 dark:text-green-400' : 
              'text-green-800 dark:text-green-300'
            }`}>
              {currentMode === 'highPerformance' ? 'Rendimiento' : 
               currentMode === 'standard' ? 'Estándar' : 
               currentMode === 'lowPower' ? 'Ahorro' : 
               'Ultra ahorro'}
            </span>
            
            {/* Indicador visual */}
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${currentMode === 'highPerformance' || currentMode === 'standard' || currentMode === 'lowPower' || currentMode === 'ultraSaving' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentMode === 'highPerformance' || currentMode === 'standard' || currentMode === 'lowPower' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentMode === 'highPerformance' || currentMode === 'standard' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentMode === 'highPerformance' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            </div>
          </div>
        </button>
        
        {/* Menú desplegable */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Seleccionar modo de energía</h3>
            </div>
            <ul className="py-1">
              {energyModes.map(mode => (
                <li key={mode.id} className="px-1 py-0.5">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      mode.id === selectedMode 
                        ? `${mode.id === 'highPerformance' ? 'bg-orange-100 dark:bg-orange-900/30' : 
                            mode.id === 'standard' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                            'bg-green-100 dark:bg-green-900/30'}`
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <div className="flex items-center">
                      <span className={`flex-shrink-0 mr-2 ${mode.color}`}>
                        {mode.icon}
                      </span>
                      <div>
                        <span className="font-medium">{mode.label}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {ENERGY_MODE_CONFIGS[mode.id].description}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentMode === 'highPerformance' ? 'Máximo rendimiento con mayor consumo.' : 
                 currentMode === 'standard' ? 'Balance entre rendimiento y ahorro.' : 
                 currentMode === 'lowPower' ? 'Prioriza duración de batería.' : 
                 'Máximo ahorro de energía.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Feedback de cambio */}
        {showConfirmation && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs w-48 z-10">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Modo cambiado a {
                selectedMode === 'highPerformance' ? 'Rendimiento' : 
                selectedMode === 'standard' ? 'Estándar' : 
                selectedMode === 'lowPower' ? 'Ahorro' : 
                'Ultra ahorro'
              }
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Variante estándar
  return (
    <div className={`energy-mode-selector relative ${className}`}>
      {/* Selector de modo actual */}
      <div>
        <button
          className={`flex items-center justify-between w-full px-4 py-2 border rounded ${currentModeData.color} bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <span className="flex-shrink-0 mr-2">
              {currentModeData.icon}
            </span>
            <span className="font-medium">{currentModeData.label}</span>
          </div>
          <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Sugerencia basada en nivel de batería */}
        {shouldShowBatteryWarning && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded text-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Batería al {batteryLevel}%. Se recomienda cambiar al modo de ahorro de energía para prolongar la duración.
              </span>
            </div>
            
            {/* Botón de acción rápida */}
            <div className="mt-2 text-right">
              <button 
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-700"
                onClick={() => handleModeSelect(shouldShowUltraSavingWarning ? 'ultraSaving' : 'lowPower')}
              >
                Cambiar a {shouldShowUltraSavingWarning ? 'Ultra ahorro' : 'Ahorro de energía'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
          <ul className="py-1">
            {energyModes.map(mode => (
              <li key={mode.id} className="px-2">
                <button
                  className={`w-full text-left p-3 rounded ${mode.id === currentMode ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <div className="flex items-center">
                    <span className={`flex-shrink-0 mr-3 ${mode.color}`}>
                      {mode.icon}
                    </span>
                    <div>
                      <span className="block font-medium">{mode.label}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{mode.description}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: {mode.recommendedWhen}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Nota sobre impacto */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              El modo de energía afecta el rendimiento, la duración de la batería y las funcionalidades disponibles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyModeSelector;