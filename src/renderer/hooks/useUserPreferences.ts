import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, UserProfileType } from '../../shared/types/User';
import { DEFAULT_USER_PREFERENCES } from '../../config/defaults';
import { ElectronAPI } from '@/shared/types/Commons';


// Declare global window with electronAPI property
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Hook personalizado para gestionar preferencias de usuario con enfoque en sostenibilidad
 * 
 * @returns Preferencias actuales y métodos para manipularlas
 */
export function useUserPreferences() {
  // Estado
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [profileType, setProfileType] = useState<UserProfileType>('technical');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carga inicial
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        
        // Verificar que la API existe y tiene el método requerido
        if (window.electronAPI) {
          try {
            const prefs = await window.electronAPI.getUserPreferences();
            if (prefs) {
              setPreferences(prefs);
            }
          } catch (prefErr) {
            console.error('Error fetching preferences:', prefErr);
            // Fallback a valores predeterminados si hay error
            setPreferences(DEFAULT_USER_PREFERENCES);
          }
          
          // Si hay perfil de usuario cargado
          try {
            const profile = await window.electronAPI.getUserProfile();
            if (profile && profile.profileType) {
              setProfileType(profile.profileType);
            }
          } catch (profileErr) {
            console.error('Error fetching user profile:', profileErr);
            // Mantener el perfil por defecto
          }
        } else {
          // Fallback a valores predeterminados
          console.warn('No electronAPI available, using default preferences');
          setPreferences(DEFAULT_USER_PREFERENCES);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError('Failed to load user preferences');
        // Fallback a valores predeterminados
        setPreferences(DEFAULT_USER_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Actualiza preferencias
  const updatePreferences = useCallback(async (
    newPreferences: Partial<UserPreferences>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const updatedPrefs = {
        ...preferences,
        ...newPreferences
      };
      
      if (window.electronAPI) {
        await window.electronAPI.updateUserPreferences(updatedPrefs);
        setPreferences(updatedPrefs);
        return true;
      }
      
      // Actualiza estado aunque no se guarde
      setPreferences(updatedPrefs);
      console.warn('No electronAPI available, preferences updated in memory only');
      return false;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update user preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);
  
  // Actualiza perfil de usuario
  const updateProfileType = useCallback(async (
    newProfileType: UserProfileType
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (window.electronAPI) {
        await window.electronAPI.updateUserProfile({ profileType: newProfileType });
        setProfileType(newProfileType);
        
        // Ajusta preferencias según perfil
        const adjustedPrefs = getDefaultPreferencesForProfile(newProfileType);
        await updatePreferences(adjustedPrefs);
        
        return true;
      }
      
      // Actualiza estado local aunque no se guarde
      setProfileType(newProfileType);
      console.warn('No electronAPI available, profile type updated in memory only');
      return false;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update user profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updatePreferences]);
  
  // Resetea preferencias a valores predeterminados
  const resetPreferences = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Obtiene preferencias predeterminadas según perfil
      const defaultPrefs = getDefaultPreferencesForProfile(profileType);
      
      if (window.electronAPI) {
        await window.electronAPI.updateUserPreferences(defaultPrefs);
      } else {
        console.warn('No electronAPI available, preferences reset in memory only');
      }
      
      setPreferences(defaultPrefs);
      return true;
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError('Failed to reset preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profileType]);
  
  // Obtiene preferencias predeterminadas según perfil
  const getDefaultPreferencesForProfile = (profile: UserProfileType): UserPreferences => {
    const base = { ...DEFAULT_USER_PREFERENCES };
    
    // Ajusta preferencias según perfil
    switch (profile) {
      case 'technical':
        return {
          ...base,
          editorMode: 'advanced',
          lineNumbers: true,
          fontSize: 14,
        };
        
      case 'writer':
        return {
          ...base,
          editorMode: 'standard',
          lineNumbers: false,
          fontSize: 16,
        };
        
      case 'manager':
        return {
          ...base,
          editorMode: 'basic',
          lineNumbers: false,
          fontSize: 16,
        };
        
      default:
        return base;
    }
  };
  
  // Retorna el estado y las funciones
  return {
    preferences,
    profileType,
    isLoading,
    error,
    updatePreferences,
    updateProfileType,
    resetPreferences
  };
}