/**
 * API Client para comunicación con el proceso principal
 * Proporciona una interfaz TypeScript para las operaciones IPC
 */

// Tipado para la API expuesta por preload.js
interface IpcAPI {
  document: {
    create: (args: {
      title?: string;
      initialContent?: string;
      metadata?: any;
      path?: string;
    }) => Promise<any>;
    get: (id: string) => Promise<any>;
    update: (args: {
      id: string;
      changes: any;
      options?: { immediate?: boolean; isAutosave?: boolean };
    }) => Promise<boolean>;
    delete: (args: {
      id: string;
      options?: { immediate?: boolean };
    }) => Promise<boolean>;
    list: (folderPath?: string) => Promise<any[]>;
    updateMetadata: (args: {
      id: string;
      metadata: any;
    }) => Promise<boolean>;
    updatePath: (args: {
      id: string;
      newPath: string;
    }) => Promise<boolean>;
    updateTags: (args: {
      id: string;
      tags: string[];
    }) => Promise<boolean>;
    getStats: () => Promise<any>;
    invalidateCache: (documentId?: string) => Promise<boolean>;
    importFiles: () => Promise<any[]>;
    importFolder: (options?: { 
      recursive?: boolean; 
      preserveStructure?: boolean 
    }) => Promise<{ documents: any[]; folders: string[] }>;
    importFile: (args: {
      filePath: string;
      targetPath?: string;
    }) => Promise<any>;
    openFile: () => Promise<any>;
    openFolder: (options?: { 
      recursive?: boolean; 
      preserveStructure?: boolean;
      loadProgressCallback?: (loaded: number, total: number) => void;
    }) => Promise<{ rootFolder: string; documents: any[]; folders: string[] }>;
    openSpecificFile: (filePath: string) => Promise<any>;
    setActive: (documentId: string) => Promise<any>;
    getActive: () => Promise<any>;
  };
  
  sustainability: {
    getMetrics: () => Promise<any>;
    getEnergyMode: () => Promise<string>;
    setEnergyMode: (mode: string) => Promise<boolean>;
    generateReport: () => Promise<any>;
    getMetricsHistory: (args: {
      timeRange?: 'hour' | 'day' | 'week' | 'month';
      limit?: number;
    }) => Promise<any[]>;
    getOptimizationSuggestions: () => Promise<any[]>;
    getBatteryStatus: () => Promise<any>;
    startIntensiveMonitoring: (duration?: number) => Promise<boolean>;
    stopIntensiveMonitoring: () => Promise<boolean>;
  };
  
  versionControl: {
    initialize: (repoPath: string) => Promise<boolean>;
    getStatus: () => Promise<any>;
    commit: (args: {
      message: string;
      files?: string[];
    }) => Promise<any>;
    push: () => Promise<any>;
    pull: () => Promise<any>;
    checkout: (branch: string) => Promise<any>;
    createBranch: (name: string) => Promise<any>;
    getHistory: (args: {
      path?: string;
      limit?: number;
    }) => Promise<any[]>;
    getDiff: (path?: string) => Promise<any>;
    trackDocument: (args: {
      documentId: string;
      path: string;
    }) => Promise<boolean>;
    getDocumentHistory: (documentId: string) => Promise<any[]>;
    revertDocument: (args: {
      documentId: string;
      version: string;
    }) => Promise<boolean>;
    isInitialized: () => Promise<boolean>;
  };
  
  search: {
    documents: (args: {
      query: string;
      options?: any;
    }) => Promise<any[]>;
    indexDocument: (document: any) => Promise<boolean>;
    removeDocument: (documentId: string) => Promise<boolean>;
    getRecentSearches: (limit?: number) => Promise<string[]>;
    saveRecentSearch: (query: string) => Promise<boolean>;
    clearRecentSearches: () => Promise<boolean>;
    rebuildIndex: () => Promise<boolean>;
  };
  
  ai: {
    generateSuggestions: (args: {
      content: string;
      context?: any;
    }) => Promise<string[]>;
    analyzeDocument: (documentId: string) => Promise<any>;
    extractKeywords: (text: string) => Promise<string[]>;
    generateSummary: (args: {
      text: string;
      maxLength?: number;
    }) => Promise<string>;
    translateText: (args: {
      text: string;
      targetLanguage: string;
    }) => Promise<string>;
    checkGrammar: (text: string) => Promise<any>;
    getMode: () => Promise<string>;
    setMode: (mode: string) => Promise<boolean>;
    isAvailable: () => Promise<boolean>;
  };
  
  sync: {
    initialize: (options?: any) => Promise<boolean>;
    sync: (documentId?: string) => Promise<any>;
    getStatus: () => Promise<any>;
    enable: (enabled: boolean) => Promise<boolean>;
    setRemote: (args: {
      url: string;
      token?: string;
    }) => Promise<boolean>;
    resolveConflict: (args: {
      documentId: string;
      resolution: string;
    }) => Promise<boolean>;
    getPendingChanges: () => Promise<any[]>;
    getLastSyncTimestamp: () => Promise<number>;
    isConfigured: () => Promise<boolean>;
  };
  
  config: {
    getUserPreferences: () => Promise<any>;
    updateUserPreferences: (preferences: any) => Promise<any>;
  };

  on: (channel: string, listener: (...args: any[]) => void) => (() => void) | null;
}

// Acceso a la API definida en preload.js
const api = window.api as unknown as IpcAPI;

/**
 * Cliente de API para operaciones de documentos
 */
export const DocumentAPI = {
  /**
   * Crea un nuevo documento
   */
  create: async (
    title?: string,
    initialContent?: string,
    metadata?: any,
    path?: string
  ) => {
    return api.document.create({
      title,
      initialContent,
      metadata,
      path
    });
  },

  /**
   * Obtiene un documento por su ID
   */
  get: async (id: string) => {
    return api.document.get(id);
  },

  /**
   * Actualiza un documento existente
   */
  update: async (
    id: string,
    changes: any,
    options?: { immediate?: boolean; isAutosave?: boolean }
  ) => {
    return api.document.update({
      id,
      changes,
      options
    });
  },

  /**
   * Elimina un documento
   */
  delete: async (
    id: string,
    options?: { immediate?: boolean }
  ) => {
    return api.document.delete({
      id,
      options
    });
  },

  /**
   * Lista documentos en una carpeta
   */
  list: async (folderPath?: string) => {
    return api.document.list(folderPath);
  },

  /**
   * Actualiza metadatos de un documento
   */
  updateMetadata: async (id: string, metadata: any) => {
    return api.document.updateMetadata({
      id,
      metadata
    });
  },

  /**
   * Actualiza ruta de un documento
   */
  updatePath: async (id: string, newPath: string) => {
    return api.document.updatePath({
      id,
      newPath
    });
  },

  /**
   * Actualiza etiquetas de un documento
   */
  updateTags: async (id: string, tags: string[]) => {
    return api.document.updateTags({
      id,
      tags
    });
  },

  /**
   * Obtiene estadísticas de documentos
   */
  getStats: async () => {
    return api.document.getStats();
  },

  /**
   * Invalida caché de documentos
   */
  invalidateCache: async (documentId?: string) => {
    return api.document.invalidateCache(documentId);
  },

  /**
   * Importa archivos usando diálogo nativo
   * Optimizado para eficiencia energética
   */
  importFiles: async () => {
    return api.document.importFiles();
  },

  /**
   * Importa una carpeta completa usando diálogo nativo
   * Con opciones para estructura y recursividad
   */
  importFolder: async (options?: {
    recursive?: boolean;
    preserveStructure?: boolean;
  }) => {
    return api.document.importFolder(options);
  },

  /**
   * Importa un archivo específico por ruta
   */
  importFile: async (filePath: string, targetPath?: string) => {
    return api.document.importFile({
      filePath,
      targetPath
    });
  },
  
  /**
   * Abre un archivo Markdown usando diálogo nativo
   * Optimizado para sostenibilidad y rendimiento
   */
  openFile: async () => {
    return api.document.openFile();
  },
  
  /**
   * Abre una carpeta con documentos Markdown usando diálogo nativo
   * Implementa carga progresiva optimizada para rendimiento
   */
  openFolder: async (options?: {
    recursive?: boolean;
    preserveStructure?: boolean;
    loadProgressCallback?: (loaded: number, total: number) => void;
  }) => {
    return api.document.openFolder(options);
  },
  
  /**
   * Abre un archivo Markdown específico por ruta
   * Sin mostrar diálogo, apertura directa
   */
  openSpecificFile: async (filePath: string) => {
    return api.document.openSpecificFile(filePath);
  },
  
  /**
   * Establece un documento como activo
   */
  setActive: async (documentId: string) => {
    return api.document.setActive(documentId);
  },
  
  /**
   * Obtiene el documento activo actual
   */
  getActive: async () => {
    return api.document.getActive();
  }
};

/**
 * Cliente de API para operaciones de sostenibilidad
 */
export const SustainabilityAPI = {
  /**
   * Obtiene métricas de sostenibilidad actuales
   */
  getMetrics: async () => {
    return api.sustainability.getMetrics();
  },

  /**
   * Obtiene modo de energía actual
   */
  getEnergyMode: async () => {
    return api.sustainability.getEnergyMode();
  },

  /**
   * Establece modo de energía
   */
  setEnergyMode: async (mode: string) => {
    return api.sustainability.setEnergyMode(mode);
  },

  /**
   * Genera informe de sostenibilidad
   */
  generateReport: async () => {
    return api.sustainability.generateReport();
  },

  /**
   * Obtiene historial de métricas
   */
  getMetricsHistory: async (
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 100
  ) => {
    return api.sustainability.getMetricsHistory({
      timeRange,
      limit
    });
  },

  /**
   * Obtiene sugerencias de optimización
   */
  getOptimizationSuggestions: async () => {
    return api.sustainability.getOptimizationSuggestions();
  },

  /**
   * Obtiene estado de batería
   */
  getBatteryStatus: async () => {
    return api.sustainability.getBatteryStatus();
  },

  /**
   * Inicia monitoreo intensivo
   */
  startIntensiveMonitoring: async (duration?: number) => {
    return api.sustainability.startIntensiveMonitoring(duration);
  },

  /**
   * Detiene monitoreo intensivo
   */
  stopIntensiveMonitoring: async () => {
    return api.sustainability.stopIntensiveMonitoring();
  }
};

/**
 * Cliente de API para operaciones de control de versiones
 */
export const VersionControlAPI = {
  /**
   * Inicializa repositorio
   */
  initialize: async (repoPath: string) => {
    return api.versionControl.initialize(repoPath);
  },

  /**
   * Obtiene estado del repositorio
   */
  getStatus: async () => {
    return api.versionControl.getStatus();
  },

  /**
   * Hace commit de cambios
   */
  commit: async (message: string, files?: string[]) => {
    return api.versionControl.commit({
      message,
      files
    });
  },

  /**
   * Envía cambios al remoto
   */
  push: async () => {
    return api.versionControl.push();
  },

  /**
   * Trae cambios del remoto
   */
  pull: async () => {
    return api.versionControl.pull();
  },

  /**
   * Cambia de rama
   */
  checkout: async (branch: string) => {
    return api.versionControl.checkout(branch);
  },

  /**
   * Crea nueva rama
   */
  createBranch: async (name: string) => {
    return api.versionControl.createBranch(name);
  },

  /**
   * Obtiene historial de commits
   */
  getHistory: async (path?: string, limit?: number) => {
    return api.versionControl.getHistory({
      path,
      limit
    });
  },

  /**
   * Obtiene diferencias
   */
  getDiff: async (path?: string) => {
    return api.versionControl.getDiff(path);
  },

  /**
   * Sigue documento
   */
  trackDocument: async (documentId: string, path: string) => {
    return api.versionControl.trackDocument({
      documentId,
      path
    });
  },

  /**
   * Obtiene historial de documento
   */
  getDocumentHistory: async (documentId: string) => {
    return api.versionControl.getDocumentHistory(documentId);
  },

  /**
   * Revierte documento a versión anterior
   */
  revertDocument: async (documentId: string, version: string) => {
    return api.versionControl.revertDocument({
      documentId,
      version
    });
  },

  /**
   * Verifica si el repositorio está inicializado
   */
  isInitialized: async () => {
    return api.versionControl.isInitialized();
  }
};

/**
 * Cliente de API para operaciones de búsqueda
 */
export const SearchAPI = {
  /**
   * Busca documentos
   */
  search: async (query: string, options?: any) => {
    return api.search.documents({
      query,
      options
    });
  },

  /**
   * Indexa documento
   */
  indexDocument: async (document: any) => {
    return api.search.indexDocument(document);
  },

  /**
   * Elimina documento del índice
   */
  removeDocument: async (documentId: string) => {
    return api.search.removeDocument(documentId);
  },

  /**
   * Obtiene búsquedas recientes
   */
  getRecentSearches: async (limit?: number) => {
    return api.search.getRecentSearches(limit);
  },

  /**
   * Guarda búsqueda reciente
   */
  saveRecentSearch: async (query: string) => {
    return api.search.saveRecentSearch(query);
  },

  /**
   * Limpia búsquedas recientes
   */
  clearRecentSearches: async () => {
    return api.search.clearRecentSearches();
  },

  /**
   * Reconstruye índice de búsqueda
   */
  rebuildIndex: async () => {
    return api.search.rebuildIndex();
  }
};

/**
 * Cliente de API para operaciones de IA
 */
export const AIAPI = {
  /**
   * Genera sugerencias
   */
  generateSuggestions: async (content: string, context?: any) => {
    return api.ai.generateSuggestions({
      content,
      context
    });
  },

  /**
   * Analiza documento
   */
  analyzeDocument: async (documentId: string) => {
    return api.ai.analyzeDocument(documentId);
  },

  /**
   * Extrae palabras clave
   */
  extractKeywords: async (text: string) => {
    return api.ai.extractKeywords(text);
  },

  /**
   * Genera resumen
   */
  generateSummary: async (text: string, maxLength?: number) => {
    return api.ai.generateSummary({
      text,
      maxLength
    });
  },

  /**
   * Traduce texto
   */
  translateText: async (text: string, targetLanguage: string) => {
    return api.ai.translateText({
      text,
      targetLanguage
    });
  },

  /**
   * Revisa gramática
   */
  checkGrammar: async (text: string) => {
    return api.ai.checkGrammar(text);
  },

  /**
   * Obtiene modo de IA
   */
  getMode: async () => {
    return api.ai.getMode();
  },

  /**
   * Establece modo de IA
   */
  setMode: async (mode: string) => {
    return api.ai.setMode(mode);
  },

  /**
   * Verifica disponibilidad de IA
   */
  isAvailable: async () => {
    return api.ai.isAvailable();
  }
};

/**
 * Cliente de API para operaciones de sincronización
 */
export const SyncAPI = {
  /**
   * Inicializa servicio de sincronización
   */
  initialize: async (options?: any) => {
    return api.sync.initialize(options);
  },

  /**
   * Sincroniza documentos
   */
  sync: async (documentId?: string) => {
    return api.sync.sync(documentId);
  },

  /**
   * Obtiene estado de sincronización
   */
  getStatus: async () => {
    return api.sync.getStatus();
  },

  /**
   * Habilita/deshabilita sincronización
   */
  enable: async (enabled: boolean) => {
    return api.sync.enable(enabled);
  },

  /**
   * Establece remoto
   */
  setRemote: async (url: string, token?: string) => {
    return api.sync.setRemote({
      url,
      token
    });
  },

  /**
   * Resuelve conflicto
   */
  resolveConflict: async (documentId: string, resolution: string) => {
    return api.sync.resolveConflict({
      documentId,
      resolution
    });
  },

  /**
   * Obtiene cambios pendientes
   */
  getPendingChanges: async () => {
    return api.sync.getPendingChanges();
  },

  /**
   * Obtiene timestamp de última sincronización
   */
  getLastSyncTimestamp: async () => {
    return api.sync.getLastSyncTimestamp();
  },

  /**
   * Verifica si está configurado
   */
  isConfigured: async () => {
    return api.sync.isConfigured();
  }
};

/**
 * Cliente de API para operaciones de configuración
 */
export const ConfigAPI = {
  /**
   * Obtiene preferencias de usuario
   */
  getUserPreferences: async () => {
    return api.config.getUserPreferences();
  },

  /**
   * Actualiza preferencias de usuario
   */
  updateUserPreferences: async (preferences: any) => {
    return api.config.updateUserPreferences(preferences);
  }
};

// Helper para suscribirse a eventos IPC
export const subscribeToEvent = (
  channel: string,
  listener: (...args: any[]) => void
) => {
  return api.on(channel, listener);
};

// Acceso directo a ayudantes de sostenibilidad
export const SustainabilityHelpers = {
  shouldExecuteOperation: (
    operationType: 'animation' | 'autosave' | 'search' | 'realtime-render' | 'ai-analysis',
    energyMode?: string
  ) => {
    return (window as any).sustainability.shouldExecuteOperation(operationType, energyMode);
  },
  
  getThrottleValue: (
    operationType: 'autosave' | 'render' | 'search' | 'sync',
    energyMode?: string
  ) => {
    return (window as any).sustainability.getThrottleValue(operationType, energyMode);
  }
};

// Exporta API completa
export default {
  Document: DocumentAPI,
  Sustainability: SustainabilityAPI,
  VersionControl: VersionControlAPI,
  Search: SearchAPI,
  AI: AIAPI,
  Sync: SyncAPI,
  Config: ConfigAPI,
  subscribeToEvent,
  SustainabilityHelpers
};