import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script que expone APIs seguras al renderer
 * Implementa puente de contexto para comunicación IPC segura
 */

// Canales IPC permitidos para invocación
const validChannels = {
  // Documento
  document: [
    'create', 'get', 'update', 'delete', 'list', 
    'updateMetadata', 'updatePath', 'updateTags', 'getStats', 'invalidateCache',
    'importFiles', 'importFolder', 'importFile', 'openFile', 'openFolder', 
    'openSpecificFile', 'setActive', 'getActive'
  ],
  // Sostenibilidad
  sustainability: [
    'getMetrics', 'getEnergyMode', 'setEnergyMode', 'generateReport',
    'getMetricsHistory', 'getOptimizationSuggestions', 'getBatteryStatus',
    'startIntensiveMonitoring', 'stopIntensiveMonitoring'
  ],
  // Control de versiones
  versionControl: [
    'initialize', 'getStatus', 'commit', 'push', 'pull',
    'checkout', 'createBranch', 'getHistory', 'getDiff',
    'trackDocument', 'getDocumentHistory', 'revertDocument', 'isInitialized'
  ],
  // Búsqueda
  search: [
    'documents', 'indexDocument', 'removeDocument',
    'getRecentSearches', 'saveRecentSearch', 'clearRecentSearches', 'rebuildIndex'
  ],
  // IA
  ai: [
    'generateSuggestions', 'analyzeDocument', 'extractKeywords',
    'generateSummary', 'translateText', 'checkGrammar',
    'getMode', 'setMode', 'isAvailable'
  ],
  // Sincronización
  sync: [
    'initialize', 'sync', 'getStatus', 'enable',
    'setRemote', 'resolveConflict', 'getPendingChanges',
    'getLastSyncTimestamp', 'isConfigured'
  ],
  // Configuración
  config: [
    'getUserPreferences', 'updateUserPreferences'
  ],
  // Eventos del sistema
  system: [
    'energy-mode-changed'
  ]
};

// Canales permitidos para eventos
const validEvents = [
  'energy-mode-changed',
  'document-updated',
  'document-created',
  'document-deleted',
  'document-imported',
  'sync-status-changed',
  'sustainability-metrics-updated',
  'version-control-status-changed',
  'ai-suggestion-ready'
];

// Crea API segura para el renderer
const api: Record<string, any> = {};

// Genera métodos de invocación para cada servicio y canal
Object.entries(validChannels).forEach(([service, channels]) => {
  api[service] = {};
  
  channels.forEach(channel => {
    // Crea función para llamar a cada canal IPC
    api[service][channel.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = (...args: any[]) => 
      ipcRenderer.invoke(`${service}:${channel}`, ...args);
  });
});

// Añade manejadores de eventos
api.on = (channel: string, listener: (...args: any[]) => void) => {
  if (validEvents.includes(channel)) {
    const subscription = (_: any, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, subscription);
    
    // Devuelve función para quitar el listener
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
  return null;
};

// Expone API al renderer
contextBridge.exposeInMainWorld('api', api);

// Expone helpers de sostenibilidad
contextBridge.exposeInMainWorld('sustainability', {
  // Ayudante para determinar si una operación debe ejecutarse
  // basado en el modo de energía actual
  shouldExecuteOperation: (operationType: 'animation' | 'autosave' | 'search' | 'realtime-render' | 'ai-analysis', energyMode?: string) => {
    const mode = energyMode || localStorage.getItem('energyMode') || 'standard';
    
    // Políticas de ejecución por modo de energía
    const policies: Record<string, Record<string, boolean>> = {
      highPerformance: {
        animation: true,
        autosave: true,
        search: true,
        'realtime-render': true,
        'ai-analysis': true
      },
      standard: {
        animation: true,
        autosave: true,
        search: true,
        'realtime-render': true,
        'ai-analysis': true
      },
      lowPower: {
        animation: false,
        autosave: true,
        search: true,
        'realtime-render': false,
        'ai-analysis': false
      },
      ultraSaving: {
        animation: false,
        autosave: false,
        search: false,
        'realtime-render': false,
        'ai-analysis': false
      }
    };
    
    return policies[mode]?.[operationType] ?? true;
  },
  
  // Obtiene valores de throttling para diferentes operaciones
  getThrottleValue: (operationType: 'autosave' | 'render' | 'search' | 'sync', energyMode?: string) => {
    const mode = energyMode || localStorage.getItem('energyMode') || 'standard';
    
    // Valores de throttling en ms por modo de energía
    const throttleValues: Record<string, Record<string, number>> = {
      highPerformance: {
        autosave: 1000, // 1 segundo
        render: 100,    // 100ms
        search: 200,    // 200ms
        sync: 60000     // 1 minuto
      },
      standard: {
        autosave: 3000, // 3 segundos
        render: 250,    // 250ms
        search: 500,    // 500ms
        sync: 300000    // 5 minutos
      },
      lowPower: {
        autosave: 10000, // 10 segundos
        render: 1000,    // 1 segundo
        search: 2000,    // 2 segundos
        sync: 1800000    // 30 minutos
      },
      ultraSaving: {
        autosave: 30000, // 30 segundos
        render: 3000,    // 3 segundos
        search: 5000,    // 5 segundos
        sync: 3600000    // 1 hora
      }
    };
    
    return throttleValues[mode]?.[operationType] ?? 
  (throttleValues as {standard: Record<string, number>}).standard[operationType];
  }
});