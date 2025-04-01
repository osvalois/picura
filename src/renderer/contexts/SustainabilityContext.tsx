import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  EnergyMode, 
  SustainabilityMetrics, 
  OptimizationSuggestion 
} from '../../shared/types/SustainabilityMetrics';
import { ElectronAPI } from '@/shared/types/Commons';

// Context API
interface SustainabilityContextType {
  // Current metrics
  sustainabilityMetrics: SustainabilityMetrics;
  // Current energy mode
  currentEnergyMode: EnergyMode;
  // Optimization suggestions
  optimizationSuggestions: OptimizationSuggestion[];
  // Sustainability report
  sustainabilityReport: {
    sessionDuration: number;
    currentPower: number;
    totalEnergy: number;
    savedEnergy: number;
    co2Savings: number;
    sustainabilityScore: number;
  } | null;
  // Functions
  setEnergyMode: (mode: EnergyMode) => Promise<void>;
  applyOptimizationSuggestion: (suggestionId: string) => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  // Loading state
  isLoading: boolean;
}


// Access to Electron API (defined in preload.js)
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Default values
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

// Context creation
const SustainabilityContext = createContext<SustainabilityContextType>(defaultContextValue);

// Provider props
interface SustainabilityProviderProps {
  children: ReactNode;
  pollInterval?: number; // Update interval in ms
}

/**
 * Sustainability Context Provider
 * Manages metrics and actions related to energy efficiency
 */
export const SustainabilityProvider: React.FC<SustainabilityProviderProps> = ({ 
  children,
  pollInterval = 5000 // Default: update every 5 seconds
}) => {
  // State
  const [metrics, setMetrics] = useState<SustainabilityMetrics>(defaultContextValue.sustainabilityMetrics);
  const [energyMode, setEnergyMode] = useState<EnergyMode>('standard');
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [report, setReport] = useState(defaultContextValue.sustainabilityReport);
  const [isLoading, setIsLoading] = useState(true);
  
  // Timer for periodic updates
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Initialization
  useEffect(() => {
    // Initial data loading
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
    
    // Configure periodic updates
    const timer = setInterval(() => {
      refreshMetrics(false); // Background update
    }, pollInterval);
    
    setPollTimer(timer);
    
    // Cleanup
    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, []);
  
  // Adjust update interval based on energy mode
  useEffect(() => {
    // Clear existing timer
    if (pollTimer) {
      clearInterval(pollTimer);
    }
    
    // Adjust interval based on mode
    let interval = pollInterval;
    
    switch (energyMode) {
      case 'highPerformance':
        interval = 2000; // More frequent
        break;
      case 'standard':
        interval = 5000; // Default
        break;
      case 'lowPower':
        interval = 10000; // Less frequent
        break;
      case 'ultraSaving':
        interval = 30000; // Minimum
        break;
    }
    
    // Configure new timer
    const timer = setInterval(() => {
      refreshMetrics(false);
    }, interval);
    
    setPollTimer(timer);
    
    return () => {
      clearInterval(timer);
    };
  }, [energyMode, pollInterval]);
  
  // Listen for IPC events
  useEffect(() => {
    // Setup listeners (implementation depends on preload.js)
    let cleanup: (() => void) | undefined;
    
    if (window.electronAPI?.onEnergyModeChanged) {
      const handler = (data: { mode: EnergyMode }) => {
        setEnergyMode(data.mode);
      };
      
      // Store the cleanup function returned by onEnergyModeChanged
      cleanup = window.electronAPI.onEnergyModeChanged(handler);
    }
    
    // Return cleanup function if available
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  
  // Update sustainability metrics
  const refreshMetrics = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      if (window.electronAPI) {
        const newMetrics = await window.electronAPI.getSustainabilityMetrics();
        setMetrics(newMetrics);
        
        // Also update suggestions if available
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
    
    // Return promise for chaining
    return Promise.resolve();
  };
  
  // Load current energy mode
  const loadEnergyMode = async () => {
    try {
      if (window.electronAPI) {
        const mode = await window.electronAPI.getEnergyMode();
        setEnergyMode(mode);
      }
    } catch (error) {
      console.error('Error loading energy mode:', error);
    }
    
    // Return promise for chaining
    return Promise.resolve();
  };
  
  // Change energy mode
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
    
    // Return promise for chaining
    return Promise.resolve();
  };
  
  // Apply an optimization suggestion
  const applyOptimization = async (suggestionId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (window.electronAPI?.applyOptimizationSuggestion) {
        const success = await window.electronAPI.applyOptimizationSuggestion(suggestionId);
        
        if (success) {
          // Update metrics and suggestions after applying
          await refreshMetrics(false);
          
          // Remove the applied suggestion from the list
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
  
  // Load sustainability report
  const loadSustainabilityReport = async () => {
    try {
      if (window.electronAPI?.getSustainabilityReport) {
        const newReport = await window.electronAPI.getSustainabilityReport();
        setReport(newReport);
      }
    } catch (error) {
      console.error('Error loading sustainability report:', error);
    }
    
    // Return promise for chaining
    return Promise.resolve();
  };
  
  // Context value
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

// Custom hook to access the context
export const useSustainabilityContext = (): SustainabilityContextType => {
  const context = useContext(SustainabilityContext);
  
  if (context === undefined) {
    throw new Error('useSustainabilityContext must be used within a SustainabilityProvider');
  }
  
  return context;
};

export default SustainabilityContext;