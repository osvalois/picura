/**
 * Tipos para la API expuesta por preload.js
 * Define la interfaz global de Window para TypeScript
 */

interface Window {
  api: {
    document: {
      create: (args: any) => Promise<any>;
      get: (id: string) => Promise<any>;
      update: (args: any) => Promise<boolean>;
      delete: (args: any) => Promise<boolean>;
      list: (folderPath?: string) => Promise<any[]>;
      updateMetadata: (args: any) => Promise<boolean>;
      updatePath: (args: any) => Promise<boolean>;
      updateTags: (args: any) => Promise<boolean>;
      getStats: () => Promise<any>;
      invalidateCache: (documentId?: string) => Promise<boolean>;
      importFiles: () => Promise<any[]>;
      importFolder: (options?: any) => Promise<{documents: any[]; folders: string[]}>;
      importFile: (args: any) => Promise<any>;
    };
    
    sustainability: {
      getMetrics: () => Promise<any>;
      getEnergyMode: () => Promise<string>;
      setEnergyMode: (mode: string) => Promise<boolean>;
      generateReport: () => Promise<any>;
      getMetricsHistory: (args: any) => Promise<any[]>;
      getOptimizationSuggestions: () => Promise<any[]>;
      getBatteryStatus: () => Promise<any>;
      startIntensiveMonitoring: (duration?: number) => Promise<boolean>;
      stopIntensiveMonitoring: () => Promise<boolean>;
    };
    
    versionControl: {
      initialize: (repoPath: string) => Promise<boolean>;
      getStatus: () => Promise<any>;
      commit: (args: any) => Promise<any>;
      push: () => Promise<any>;
      pull: () => Promise<any>;
      checkout: (branch: string) => Promise<any>;
      createBranch: (name: string) => Promise<any>;
      getHistory: (args: any) => Promise<any[]>;
      getDiff: (path?: string) => Promise<any>;
      trackDocument: (args: any) => Promise<boolean>;
      getDocumentHistory: (documentId: string) => Promise<any[]>;
      revertDocument: (args: any) => Promise<boolean>;
      isInitialized: () => Promise<boolean>;
    };
    
    search: {
      documents: (args: any) => Promise<any[]>;
      indexDocument: (document: any) => Promise<boolean>;
      removeDocument: (documentId: string) => Promise<boolean>;
      getRecentSearches: (limit?: number) => Promise<string[]>;
      saveRecentSearch: (query: string) => Promise<boolean>;
      clearRecentSearches: () => Promise<boolean>;
      rebuildIndex: () => Promise<boolean>;
    };
    
    ai: {
      generateSuggestions: (args: any) => Promise<string[]>;
      analyzeDocument: (documentId: string) => Promise<any>;
      extractKeywords: (text: string) => Promise<string[]>;
      generateSummary: (args: any) => Promise<string>;
      translateText: (args: any) => Promise<string>;
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
      setRemote: (args: any) => Promise<boolean>;
      resolveConflict: (args: any) => Promise<boolean>;
      getPendingChanges: () => Promise<any[]>;
      getLastSyncTimestamp: () => Promise<number>;
      isConfigured: () => Promise<boolean>;
    };
    
    config: {
      getUserPreferences: () => Promise<any>;
      updateUserPreferences: (preferences: any) => Promise<any>;
    };
  
    on: (channel: string, listener: (...args: any[]) => void) => (() => void) | null;
  };
  
  sustainability: {
    shouldExecuteOperation: (
      operationType: 'animation' | 'autosave' | 'search' | 'realtime-render' | 'ai-analysis',
      energyMode?: string
    ) => boolean;
    
    getThrottleValue: (
      operationType: 'autosave' | 'render' | 'search' | 'sync',
      energyMode?: string
    ) => number;
  };
}