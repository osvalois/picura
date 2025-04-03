import { useState, useEffect, useCallback } from 'react';
import { 
  ViewerSettings,
  defaultViewerSettings,
  defaultLightTheme,
  defaultDarkTheme
} from '../utils/viewerConfig';

interface UseViewerSettingsProps {
  initialSettings?: Partial<ViewerSettings>;
  darkMode?: boolean;
}

interface UseViewerSettingsResult {
  settings: ViewerSettings;
  updateSettings: (newSettings: Partial<ViewerSettings>) => void;
  resetSettings: () => void;
  toggleDarkMode: () => void;
}

/**
 * Hook para gestionar la configuración del visor
 */
export function useViewerSettings({
  initialSettings = {},
  darkMode = false
}: UseViewerSettingsProps = {}): UseViewerSettingsResult {
  // Inicializa con la configuración predeterminada más cualquier configuración personalizada
  const [settings, setSettings] = useState<ViewerSettings>({
    ...defaultViewerSettings,
    theme: darkMode ? defaultDarkTheme : defaultLightTheme,
    ...initialSettings
  });

  // Maneja cambios en el modo oscuro
  useEffect(() => {
    setSettings(prevSettings => ({
      ...prevSettings,
      theme: darkMode ? defaultDarkTheme : defaultLightTheme
    }));
  }, [darkMode]);

  // Actualiza la configuración
  const updateSettings = useCallback((newSettings: Partial<ViewerSettings>) => {
    setSettings(prevSettings => {
      // Para el tema, combinamos los objetos en lugar de reemplazar
      if (newSettings.theme) {
        return {
          ...prevSettings,
          ...newSettings,
          theme: {
            ...prevSettings.theme,
            ...newSettings.theme
          }
        };
      }
      
      // Para otras configuraciones, simplemente actualizamos los valores
      return {
        ...prevSettings,
        ...newSettings
      };
    });
  }, []);

  // Restablece la configuración a los valores predeterminados
  const resetSettings = useCallback(() => {
    setSettings({
      ...defaultViewerSettings,
      theme: darkMode ? defaultDarkTheme : defaultLightTheme
    });
  }, [darkMode]);

  // Alterna entre los temas claro y oscuro
  const toggleDarkMode = useCallback(() => {
    setSettings(prevSettings => {
      const isDarkMode = prevSettings.theme === defaultDarkTheme;
      return {
        ...prevSettings,
        theme: isDarkMode ? defaultLightTheme : defaultDarkTheme
      };
    });
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleDarkMode
  };
}