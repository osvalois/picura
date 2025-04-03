import { useState, useEffect, useCallback } from 'react';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';

type EditorMode = 'basic' | 'standard' | 'advanced';
type ProfileType = 'technical' | 'writer' | 'manager' | 'default' | 'custom';

interface EditorPreferences {
  editorMode: EditorMode;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  tabSize: number;
  sustainabilityMetricsVisible: boolean;
  autosave: boolean;
}

interface UseEditorPreferenceProps {
  initialEditorMode?: EditorMode;
  profileType?: ProfileType;
  onEditorModeChange?: (mode: EditorMode) => void;
  currentEnergyMode: EnergyMode;
}

interface UseEditorPreferenceResult {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  preferences: EditorPreferences;
}

/**
 * Hook para gestionar preferencias del editor adaptadas al tipo de perfil y modo de energía
 */
export function useEditorPreference({
  initialEditorMode = 'standard',
  profileType = 'default',
  onEditorModeChange,
  currentEnergyMode
}: UseEditorPreferenceProps): UseEditorPreferenceResult {
  // Estado para el modo de editor actual
  const [editorMode, setEditorModeState] = useState<EditorMode>(initialEditorMode);
  
  // Preferencias predeterminadas
  const [preferences, setPreferences] = useState<EditorPreferences>({
    editorMode: initialEditorMode,
    fontSize: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif', 
    lineNumbers: true,
    tabSize: 2,
    sustainabilityMetricsVisible: true,
    autosave: true
  });

  // Actualiza el modo de editor con efectos secundarios
  const setEditorMode = useCallback((mode: EditorMode) => {
    setEditorModeState(mode);
    setPreferences(prev => ({
      ...prev,
      editorMode: mode
    }));
    
    // Notificamos el cambio si hay un callback
    if (onEditorModeChange) {
      onEditorModeChange(mode);
    }
  }, [onEditorModeChange]);

  // Ajusta modo de editor basado en perfil
  useEffect(() => {
    // Solo aplica cambio automático al inicio o cambio de perfil
    const determineEditorMode = () => {
      switch (profileType) {
        case 'technical':
          return 'advanced';
        case 'writer':
          return 'standard';
        case 'manager': 
          return 'basic';
        default:
          return initialEditorMode;
      }
    };
    
    const appropriateMode = determineEditorMode();
    if (appropriateMode !== editorMode) {
      setEditorMode(appropriateMode);
    }
  }, [profileType, initialEditorMode, editorMode, setEditorMode]);

  // Ajusta preferencias según el modo de energía
  useEffect(() => {
    setPreferences(prev => {
      // Ajustes para modos de bajo consumo
      if (currentEnergyMode === 'ultraSaving') {
        return {
          ...prev,
          lineNumbers: false, // Desactiva números de línea para ahorrar recursos
          sustainabilityMetricsVisible: true, // Hace más visible el consumo
          fontSize: prev.fontSize // Mantiene tamaño de fuente
        };
      } else if (currentEnergyMode === 'lowPower') {
        return {
          ...prev,
          lineNumbers: true,
          sustainabilityMetricsVisible: true
        };
      } else {
        // Configuración para modos estándar y alto rendimiento
        return {
          ...prev,
          lineNumbers: true
        };
      }
    });
  }, [currentEnergyMode]);
  
  return {
    editorMode,
    setEditorMode,
    preferences
  };
}