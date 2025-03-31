import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  EnergyMode, 
  SustainabilityMetrics, 
  OptimizationSuggestion 
} from '../../shared/types/SustainabilityMetrics';

// API del contexto
interface SustainabilityContextType {
  // Métricas actuales
  sustainabilityMetrics: SustainabilityMetrics;
  // Modo de energía actual
  currentEnergyMode: EnergyMode;
  // Sugerencias de optimización
  optimizationSuggestions: OptimizationSuggestion[];
  // Informe de sostenibilidad
  sustainabilityReport: {
    sessionDuration: number;
    currentPower: number;
    totalEnergy: number;
    savedEnergy: number;
    co2Savings: number;
    sustainabilityScore: number;
  } | null;
  // Funciones
  setEnergyMode: (mode: EnergyMode) => Promise<void>;
  applyOptimizationSuggestion: (suggestionId: string) => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  // Estado de carga
  isLoading: boolean;
}

// Configuración de IPC
interface ElectronAPI {
  getSustainabilityMetrics: () => Promise<SustainabilityMetrics>;
  getEnergyMode: () => Promise<EnergyMode>;
  setEnergyMode: (mode: EnergyMode) => Promise<void>;
  getSustainabilityReport: () => Promise<any>;
  applyOptimizationSuggestion: (id: string) => Promise<boolean>;
  // Otros métodos según necesidad...
}

// Acceso a API de Electron (definida en preload.js)
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Valores por defecto
const defaultContextValue: SustainabilityContextType = {
  sustainabilityMetrics: {
    cpu: { current: 0, average: 0, peak: 0 },
    memory: { current: 0, average: 0, peak: 0 },
    disk: { reads: 0, writes: 0 },
    network: { sent: 0, received: 0 },
    battery: { isCharging: true, level: 100 },
    estimatedEnergy: { current: 0, total: 0 },
  },
  currentEnergyMode: 'standard',
  optimizationSuggestions: [],
  sustainabilityReport: null,
  setEnergyMode: async () => {},
  applyOptimizationSuggestion: async () => false,
  refreshMetrics: async () => {},
  isLoading: true,
};

// Creación del contexto
const SustainabilityContext = createContext<SustainabilityContextType>(defaultContextValue);

// Props para el proveedor
interface SustainabilityProviderProps {
  children: ReactNode;
  pollInterval?: number; // Intervalo de actualización en ms
}

/**
 * Proveedor del contexto de sostenibilidad
 * Gestiona métricas y acciones relacionadas con eficiencia energética
 */
export const SustainabilityProvider: React.FC<SustainabilityProviderProps> = ({ 
  children,
  pollInterval = 5000 // Por defecto, actualiza cada 5 segundos
}) => {
  // Estado
  const [metrics, setMetrics] = useState<SustainabilityMetrics>(defaultContextValue.sustainabilityMetrics);
  const [energyMode, setEnergyMode] = useState<EnergyMode>('standard');
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [report, setReport] = useState(defaultContextValue.sustainabilityReport);
  const [isLoading, setIsLoading] = useState(true);
  
  // Temporizador para actualizaciones periódicas
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Inicialización
  useEffect(() => {
    // Carga inicial de datos
    const initialize = async () => {
      try {
        await Promise.all([
          refreshMetrics(),
          loadEnergyMode(),
          loadSustainabilityReport()
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing sustainability context:', error);
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Configuración de actualización periódica
    const timer = setInterval(() => {
      refreshMetrics(false); // Actualización en segundo plano
    }, pollInterval);
    
    setPollTimer(timer);
    
    // Limpieza
    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, []);
  
  // Ajusta intervalo de actualización según el modo de energía
  useEffect(() => {
    // Limpia temporizador existente
    if (pollTimer) {
      clearInterval(pollTimer);
    }
    
    // Ajusta intervalo según modo
    let interval = pollInterval;
    
    switch (energyMode) {
      case 'highPerformance':
        interval = 2000; // Más frecuente
        break;
      case 'standard':
        interval = 5000; // Predeterminado
        break;
      case 'lowPower':
        interval = 10000; // Menos frecuente
        break;
      case 'ultraSaving':
        interval = 30000; // Mínimo
        break;
    }
    
    // Configura nuevo temporizador
    const timer = setInterval(() => {
      refreshMetrics(false);
    }, interval);
    
    setPollTimer(timer);
    
    return () => {
      clearInterval(timer);
    };
  }, [energyMode]);
  
  // Escucha eventos de IPC para actualizaciones
  useEffect(() => {
    // Configuración de listeners (implementación depende de preload.js)
    const setupListeners = () => {
      // Ejemplo: escuchar cambios de modo de energía
      if (window.electronAPI && window.electronAPI.onEnergyModeChanged) {
        window.electronAPI.onEnergyModeChanged((event: any, data: any) => {
          setEnergyMode(data.mode);
        });
      }
      
      // Otros listeners según necesidad...
    };
    
    setupListeners();
  }, []);
  
  // Actualiza métricas de sostenibilidad
  const refreshMetrics = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      if (window.electronAPI) {
        const newMetrics = await window.electronAPI.getSustainabilityMetrics();
        setMetrics(newMetrics);
        
        // También actualiza sugerencias si están disponibles
        if (window.electronAPI.getOptimizationSuggestions) {
          const newSuggestions = await window.electronAPI.getOptimizationSuggestions();
          setSuggestions(newSuggestions);
        }
      }
    } catch (error) {
      console.error('Error fetching sustainability metrics:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };
  
  // Carga modo de energía actual
  const loadEnergyMode = async () => {
    try {
      if (window.electronAPI) {
        const mode = await window.electronAPI.getEnergyMode();
        setEnergyMode(mode);
      }
    } catch (error) {
      console.error('Error loading energy mode:', error);
    }
  };
  
  // Cambia modo de energía
  const changeEnergyMode = async (mode: EnergyMode) => {
    try {
      setIsLoading(true);
      
      if (window.electronAPI) {
        await window.electronAPI.setEnergyMode(mode);
        setEnergyMode(mode);
      }
    } catch (error) {
      console.error('Error setting energy mode:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Aplica una sugerencia de optimización
  const applyOptimization = async (suggestionId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (window.electronAPI && window.electronAPI.applyOptimizationSuggestion) {
        const success = await window.electronAPI.applyOptimizationSuggestion(suggestionId);
        
        if (success) {
          // Actualiza métricas y sugerencias después de aplicar
          await refreshMetrics(false);
          
          // Elimina la sugerencia aplicada de la lista
          setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        }
        
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Error applying optimization:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carga informe de sostenibilidad
  const loadSustainabilityReport = async () => {
    try {
      if (window.electronAPI && window.electronAPI.getSustainabilityReport) {
        const newReport = await window.electronAPI.getSustainabilityReport();
        setReport(newReport);
      }
    } catch (error) {
      console.error('Error loading sustainability report:', error);
    }
  };
  
  // Valor del contexto
  const contextValue: SustainabilityContextType = {
    sustainabilityMetrics: metrics,
    currentEnergyMode: energyMode,
    optimizationSuggestions: suggestions,
    sustainabilityReport: report,
    setEnergyMode: changeEnergyMode,
    applyOptimizationSuggestion: applyOptimization,
    refreshMetrics,
    isLoading,
  };
  
  return (
    <SustainabilityContext.Provider value={contextValue}>
      {children}
    </SustainabilityContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useSustainabilityContext = (): SustainabilityContextType => {
  const context = useContext(SustainabilityContext);
  
  if (context === undefined) {
    throw new Error('useSustainabilityContext must be used within a SustainabilityProvider');
  }
  
  return context;
};

export default SustainabilityContext;