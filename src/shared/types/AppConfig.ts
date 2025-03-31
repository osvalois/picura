/**
 * Tipos para configuración de la aplicación
 */

export interface AppConfig {
  general: GeneralConfig;
  editor: EditorConfig;
  appearance: AppearanceConfig;
  performance: PerformanceConfig;
  sustainability: SustainabilityConfig;
  sync: SyncConfig;
  versionControl: VersionControlConfig;
  ai: AIConfig;
  advanced: AdvancedConfig;
}

export interface GeneralConfig {
  defaultDocumentLocation: string;
  autosave: boolean;
  autosaveInterval: number; // En ms
  openLastDocument: boolean;
  recentDocumentsLimit: number;
  defaultEditorMode: 'basic' | 'standard' | 'advanced';
  language: string;
}

export interface EditorConfig {
  spellcheck: boolean;
  autocomplete: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  indentWithTabs: boolean;
  tabSize: number;
  fontSize: number;
  fontFamily: string;
  markdownFlavor: 'gfm' | 'commonmark' | 'markdown' | 'custom';
  enableExtensions: boolean;
  customExtensions: string[];
}

export interface AppearanceConfig {
  theme: 'light' | 'dark' | 'system';
  customThemePath?: string;
  iconSet: 'default' | 'minimal' | 'custom';
  reducedAnimations: boolean;
  focusMode: boolean;
  customFonts: Record<string, string>;
  displayDensity: 'compact' | 'comfortable' | 'spacious';
}

export interface PerformanceConfig {
  enableWebWorkers: boolean;
  useHardwareAcceleration: boolean;
  maxUndoHistory: number;
  optimizeMemoryUsage: boolean;
  cacheSize: number; // En MB
  indexingStrategy: 'immediate' | 'deferred' | 'manual';
  preloadHeavyComponents: boolean;
}

export interface SustainabilityConfig {
  defaultEnergyMode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance';
  adaptToSystemPower: boolean;
  lowBatteryThreshold: number; // Porcentaje
  criticalBatteryThreshold: number; // Porcentaje
  showSustainabilityMetrics: boolean;
  optimizeStorageAutomatically: boolean;
  resourceMonitoringInterval: number; // En ms
  resourceThresholds: {
    cpu: {
      high: number;
      critical: number;
    };
    memory: {
      high: number;
      critical: number;
    };
  };
}

export interface SyncConfig {
  enabled: boolean;
  provider: 'git' | 'local' | 'cloud' | 'none';
  autoSync: boolean;
  syncInterval: number; // En ms
  conflictResolution: 'manual' | 'remote' | 'local' | 'newest';
  remoteBranch?: string;
  remoteUrl?: string;
  credentials?: {
    username?: string;
    token?: string;
  };
}

export interface VersionControlConfig {
  enabled: boolean;
  autoVersionOnSave: boolean;
  versionInterval: number; // En ms, 0 para cada guardado
  maxVersionsToKeep: number;
  compressOldVersions: boolean;
  commitMessageTemplate: string;
  defaultCommitMessage: string;
  gitIntegration: boolean;
  gitConfig?: {
    user: string;
    email: string;
    signingKey?: string;
  };
}

export interface AIConfig {
  enabled: boolean;
  provider: 'local' | 'openai' | 'anthropic' | 'none';
  apiKey?: string;
  model?: string;
  contextLength: number;
  temperatureDefault: number;
  saveSuggestions: boolean;
  enhancementSuggestions: boolean;
  usageLimit?: number; // Créditos o límite mensual
  sustainabilityAwareness: boolean;
  localProcessingFirst: boolean;
}

export interface AdvancedConfig {
  developerMode: boolean;
  diagnosticsEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableExperimentalFeatures: boolean;
  customStyles?: string;
  customScripts?: string[];
  pluginDirectories?: string[];
  proxyConfiguration?: {
    enabled: boolean;
    host?: string;
    port?: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}