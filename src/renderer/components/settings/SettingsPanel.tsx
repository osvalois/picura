import React, { useState, useEffect } from 'react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { UserPreferences, UserProfileType } from '../../../shared/types/User';
import { EnergyMode } from '../../../shared/types/SustainabilityMetrics';

interface SettingsPanelProps {
  onClose: () => void;
  initialTab?: 'general' | 'editor' | 'appearance' | 'sustainability' | 'advanced';
}

/**
 * Panel de configuración con optimizaciones de energía
 * Adapta UI y funcionalidades según el modo de energía actual
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  initialTab = 'general'
}) => {
  // Contextos y estados
  const { 
    preferences, 
    profileType, 
    updatePreferences, 
    updateProfileType,
    resetPreferences,
    isLoading,
    error
  } = useUserPreferences();
  
  const { 
    currentEnergyMode, 
    setEnergyMode,
    sustainabilityMetrics
  } = useSustainabilityContext();
  
  // Estado del formulario
  const [formValues, setFormValues] = useState<UserPreferences>({} as UserPreferences);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileType>(profileType);
  const [selectedTab, setSelectedTab] = useState<string>(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Inicializa el formulario cuando se cargan las preferencias
  useEffect(() => {
    if (preferences && !isLoading) {
      setFormValues({ ...preferences });
    }
  }, [preferences, isLoading]);
  
  // Detecta cambios en el formulario
  useEffect(() => {
    if (Object.keys(formValues).length > 0 && !isLoading) {
      const changed = JSON.stringify(formValues) !== JSON.stringify(preferences) ||
                     selectedProfile !== profileType;
      setHasChanges(changed);
    }
  }, [formValues, preferences, selectedProfile, profileType, isLoading]);
  
  // Maneja cambios en campos de formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Maneja diferentes tipos de inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      setFormValues(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Maneja cambio de modo de energía
  const handleEnergyModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as EnergyMode;
    setFormValues(prev => ({
      ...prev,
      energyMode: newMode
    }));
  };
  
  // Maneja cambio de perfil de usuario
  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProfile(e.target.value as UserProfileType);
  };
  
  // Guarda cambios
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Primero actualiza el perfil si cambió
      if (selectedProfile !== profileType) {
        await updateProfileType(selectedProfile);
      }
      
      // Luego actualiza las preferencias
      const success = await updatePreferences(formValues);
      
      if (success) {
        setSaveMessage('Configuración guardada correctamente');
        
        // Aplica el modo de energía si cambió
        if (formValues.energyMode !== currentEnergyMode) {
          setEnergyMode(formValues.energyMode);
        }
        
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('No se pudieron guardar todos los cambios');
      }
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setSaveMessage('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Descarta cambios
  const handleCancel = () => {
    setFormValues({ ...preferences });
    setSelectedProfile(profileType);
    setSaveMessage('');
    setHasChanges(false);
  };
  
  // Restaura configuración predeterminada
  const handleReset = async () => {
    setIsSaving(true);
    
    try {
      const success = await resetPreferences();
      
      if (success) {
        setSaveMessage('Configuración restablecida a valores predeterminados');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('No se pudo restablecer la configuración');
      }
    } catch (err) {
      console.error('Error restableciendo configuración:', err);
      setSaveMessage('Error al restablecer la configuración');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Si está cargando, muestra indicador
  if (isLoading || Object.keys(formValues).length === 0) {
    return (
      <div className="settings-panel fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="loading-spinner" aria-label="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="settings-panel fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Cabecera */}
      <div className="settings-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configuración</h2>
        
        <div className="flex items-center gap-4">
          {hasChanges && (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mensaje de guardado */}
      {saveMessage && (
        <div className="save-message p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-center">
          {saveMessage}
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="error-message p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-center">
          {error}
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="settings-content flex flex-1 overflow-hidden">
        {/* Pestañas laterales */}
        <div className="settings-tabs w-48 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedTab('general')}
                className={`w-full text-left p-2 rounded ${selectedTab === 'general' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                General
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('editor')}
                className={`w-full text-left p-2 rounded ${selectedTab === 'editor' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Editor
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('appearance')}
                className={`w-full text-left p-2 rounded ${selectedTab === 'appearance' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Apariencia
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('sustainability')}
                className={`w-full text-left p-2 rounded ${selectedTab === 'sustainability' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Sostenibilidad
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('advanced')}
                className={`w-full text-left p-2 rounded ${selectedTab === 'advanced' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Avanzado
              </button>
            </li>
          </ul>
          
          <div className="mt-8">
            <button
              onClick={handleReset}
              className="w-full text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            >
              Restablecer valores predeterminados
            </button>
          </div>
        </div>
        
        {/* Formulario de configuración */}
        <div className="settings-form flex-1 p-6 overflow-y-auto">
          {/* Configuración general */}
          {selectedTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configuración general</h3>
              
              <div className="form-group">
                <label htmlFor="profile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Perfil de usuario
                </label>
                <select
                  id="profile"
                  name="profile"
                  value={selectedProfile}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="technical">Técnico</option>
                  <option value="writer">Escritor</option>
                  <option value="manager">Gestor</option>
                  <option value="custom">Personalizado</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedProfile === 'technical' && 'Para desarrolladores y usuarios técnicos. Editor avanzado con características técnicas.'}
                  {selectedProfile === 'writer' && 'Para escritores y redactores. Editor estándar con funciones de estilo.'}
                  {selectedProfile === 'manager' && 'Para gestores y revisores. Editor simplificado con funciones básicas.'}
                  {selectedProfile === 'custom' && 'Configuración personalizada según tus preferencias.'}
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="autosave" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="autosave"
                    name="autosave"
                    checked={formValues.autosave}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2">Guardar automáticamente</span>
                </label>
              </div>
              
              {formValues.autosave && (
                <div className="form-group">
                  <label htmlFor="autosaveInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Intervalo de guardado automático (segundos)
                  </label>
                  <input
                    type="number"
                    id="autosaveInterval"
                    name="autosaveInterval"
                    value={formValues.autosaveInterval / 1000}
                    onChange={(e) => {
                      const seconds = parseFloat(e.target.value);
                      setFormValues(prev => ({
                        ...prev,
                        autosaveInterval: seconds * 1000
                      }));
                    }}
                    min="5"
                    max="300"
                    step="5"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="spellcheck" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="spellcheck"
                    name="spellcheck"
                    checked={formValues.spellcheck}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2">Corrector ortográfico</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Configuración del editor */}
          {selectedTab === 'editor' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configuración del editor</h3>
              
              <div className="form-group">
                <label htmlFor="editorMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modo de editor
                </label>
                <select
                  id="editorMode"
                  name="editorMode"
                  value={formValues.editorMode}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="basic">Básico</option>
                  <option value="standard">Estándar</option>
                  <option value="advanced">Avanzado</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formValues.editorMode === 'basic' && 'Editor simplificado con funciones básicas. Menor consumo energético.'}
                  {formValues.editorMode === 'standard' && 'Editor equilibrado con funciones esenciales. Consumo energético moderado.'}
                  {formValues.editorMode === 'advanced' && 'Editor completo con todas las funciones. Mayor consumo energético.'}
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tamaño de fuente
                </label>
                <input
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  value={formValues.fontSize}
                  onChange={handleChange}
                  min="10"
                  max="24"
                  step="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Familia de fuente
                </label>
                <select
                  id="fontFamily"
                  name="fontFamily"
                  value={formValues.fontFamily}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="system-ui, -apple-system, sans-serif">Sistema (Default)</option>
                  <option value="'Courier New', monospace">Monoespaciada</option>
                  <option value="'Georgia', serif">Serif</option>
                  <option value="'Arial', sans-serif">Sans-serif</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="lineNumbers" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="lineNumbers"
                    name="lineNumbers"
                    checked={formValues.lineNumbers}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2">Mostrar números de línea</span>
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="tabSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tamaño de tabulación
                </label>
                <select
                  id="tabSize"
                  name="tabSize"
                  value={formValues.tabSize}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="2">2 espacios</option>
                  <option value="4">4 espacios</option>
                  <option value="8">8 espacios</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Configuración de apariencia */}
          {selectedTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Apariencia</h3>
              
              <div className="form-group">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tema
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formValues.theme}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="system">Sistema (automático)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El tema oscuro reduce el consumo de energía en pantallas OLED.
                </p>
              </div>
            </div>
          )}
          
          {/* Configuración de sostenibilidad */}
          {selectedTab === 'sustainability' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sostenibilidad</h3>
              
              <div className="form-group">
                <label htmlFor="energyMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modo de energía
                </label>
                <select
                  id="energyMode"
                  name="energyMode"
                  value={formValues.energyMode}
                  onChange={handleEnergyModeChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="standard">Estándar (equilibrado)</option>
                  <option value="lowPower">Bajo consumo</option>
                  <option value="ultraSaving">Ahorro máximo</option>
                  <option value="highPerformance">Alto rendimiento</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formValues.energyMode === 'standard' && 'Equilibra rendimiento y eficiencia energética.'}
                  {formValues.energyMode === 'lowPower' && 'Reduce el consumo energético optimizando características no esenciales.'}
                  {formValues.energyMode === 'ultraSaving' && 'Maximiza el ahorro energético desactivando características no críticas.'}
                  {formValues.energyMode === 'highPerformance' && 'Prioriza el rendimiento sobre el ahorro energético. Recomendado solo con alimentación externa.'}
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="sustainabilityMetricsVisible" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="sustainabilityMetricsVisible"
                    name="sustainabilityMetricsVisible"
                    checked={formValues.sustainabilityMetricsVisible}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2">Mostrar métricas de sostenibilidad</span>
                </label>
              </div>
              
              {/* Métricas actuales */}
              {sustainabilityMetrics && (
                <div className="metrics-panel mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Métricas actuales</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="metric">
                      <div className="text-xs text-gray-500 dark:text-gray-400">CPU</div>
                      <div className="text-sm font-medium">{Math.round(sustainabilityMetrics.cpu.current)}%</div>
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-1 bg-blue-500" 
                          style={{ width: `${sustainabilityMetrics.cpu.current}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="metric">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Memoria</div>
                      <div className="text-sm font-medium">{Math.round(sustainabilityMetrics.memory.current)}%</div>
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-1 bg-blue-500" 
                          style={{ width: `${sustainabilityMetrics.memory.current}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="metric">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Batería</div>
                      <div className="text-sm font-medium">
                        {sustainabilityMetrics.battery.isCharging 
                          ? 'Cargando'
                          : `${Math.round(sustainabilityMetrics.battery.level * 100)}%`
                        }
                      </div>
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-1 ${sustainabilityMetrics.battery.isCharging ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${sustainabilityMetrics.battery.level * 100}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="metric">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Energía estimada</div>
                      <div className="text-sm font-medium">{sustainabilityMetrics.estimatedEnergy.current} mW</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Configuración avanzada */}
          {selectedTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configuración avanzada</h3>
              
              <div className="form-group">
                <label htmlFor="enableAI" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="enableAI"
                    name="enableAI"
                    checked={formValues.enableAI}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2">Habilitar asistente IA</span>
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El asistente IA consume más recursos. Se desactiva automáticamente en modo de ahorro máximo.
                </p>
              </div>
              
              <div className="alert p-4 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-lg">
                <h4 className="font-medium">Nota sobre sostenibilidad</h4>
                <p className="text-sm mt-1">
                  Algunas configuraciones avanzadas pueden incrementar el consumo de energía.
                  Considere utilizar el modo de bajo consumo para optimizar la duración de la batería.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;