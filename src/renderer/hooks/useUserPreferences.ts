import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, UserProfileType } from '../../shared/types/User';
import { DEFAULT_USER_PREFERENCES } from '../../config/defaults';

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
        
        if (window.electronAPI && window.electronAPI.getUserPreferences) {
          const prefs = await window.electronAPI.getUserPreferences();
          setPreferences(prefs);
          
          // Si hay perfil de usuario cargado
          if (window.electronAPI.getUserProfile) {
            const profile = await window.electronAPI.getUserProfile();
            setProfileType(profile.profileType);
          }
        } else {
          // Fallback a valores predeterminados
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
      
      if (window.electronAPI && window.electronAPI.updateUserPreferences) {
        await window.electronAPI.updateUserPreferences(updatedPrefs);
        setPreferences(updatedPrefs);
        return true;
      }
      
      // Actualiza estado aunque no se guarde
      setPreferences(updatedPrefs);
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
      
      if (window.electronAPI && window.electronAPI.updateUserProfile) {
        await window.electronAPI.updateUserProfile({ profileType: newProfileType });
        setProfileType(newProfileType);
        
        // Ajusta preferencias según perfil
        const adjustedPrefs = getDefaultPreferencesForProfile(newProfileType);
        await updatePreferences(adjustedPrefs);
        
        return true;
      }
      
      // Actualiza estado local aunque no se guarde
      setProfileType(newProfileType);
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
      
      if (window.electronAPI && window.electronAPI.updateUserPreferences) {
        await window.electronAPI.updateUserPreferences(defaultPrefs);
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