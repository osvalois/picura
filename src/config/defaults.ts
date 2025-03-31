import { UserPreferences } from '../shared/types/User';
import { EnergyMode } from '../shared/types/SustainabilityMetrics';

// Sync configuration
export const SYNC_CONFIG = {
  git: {
    authorName: 'Picura User',
    authorEmail: 'user@picura.app',
    defaultBranch: 'main',
    syncInterval: 300000, // 5 minutos
    commitInterval: 900000, // 15 minutos (para autocommit)
    maxRetries: 3
  }
};

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  editorMode: 'standard',
  fontSize: 16,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  tabSize: 2,
  spellcheck: true,
  autosave: true,
  autosaveInterval: 30000, // 30 seconds
  lineNumbers: true,
  enableAI: true,
  energyMode: 'standard',
  sustainabilityMetricsVisible: true,
};

// Energy mode configurations
export const ENERGY_MODE_CONFIGS: Record<EnergyMode, {
  description: string;
  features: Record<string, boolean | number | string>;
}> = {
  standard: {
    description: 'Balance entre rendimiento y eficiencia energética',
    features: {
      animations: true,
      livePreview: true,
      backgroundProcessing: true,
      asyncIndexing: true,
      autosaveInterval: 30000,
      aiSuggestions: true,
      renderOptimization: "medium",
      cacheTTL: 3600000, // 1 hour
    }
  },
  lowPower: {
    description: 'Reduce el consumo energético manteniendo funcionalidad esencial',
    features: {
      animations: false,
      livePreview: false,
      backgroundProcessing: false,
      asyncIndexing: true,
      autosaveInterval: 60000,
      aiSuggestions: true,
      renderOptimization: "high",
      cacheTTL: 7200000, // 2 hours
    }
  },
  ultraSaving: {
    description: 'Máximo ahorro de energía para situaciones críticas de batería',
    features: {
      animations: false,
      livePreview: false,
      backgroundProcessing: false,
      asyncIndexing: false,
      autosaveInterval: 300000, // 5 minutes
      aiSuggestions: false,
      renderOptimization: "maximum",
      cacheTTL: 14400000, // 4 hours
    }
  },
  highPerformance: {
    description: 'Máximo rendimiento para dispositivos con alimentación de red',
    features: {
      animations: true,
      livePreview: true,
      backgroundProcessing: true,
      asyncIndexing: true,
      autosaveInterval: 10000,
      aiSuggestions: true,
      renderOptimization: "low",
      cacheTTL: 1800000, // 30 minutes
    }
  }
};

// Paths configuration
export const PATHS = {
  userData: 'userData',
  documents: 'documents',
  templates: 'templates',
  database: 'picura.db',
  config: 'config.json',
  cache: 'cache',
};

// Application constants
export const APP_CONSTANTS = {
  appName: 'Picura MD',
  appVersion: '0.1.0',
  appAuthor: 'Picura Team',
  maxDocumentSize: 10 * 1024 * 1024, // 10MB
  supportedExportFormats: ['pdf', 'html', 'docx'],
  defaultMarkdownFlavor: 'gfm', // GitHub Flavored Markdown
  indexingBatchSize: 20,
  gitSyncInterval: 300000, // 5 minutes
};

// Database configuration
export const DATABASE_CONFIG = {
  pragma: {
    'journal_mode': 'WAL',     // Write-Ahead Logging
    'synchronous': 'NORMAL',   // Balance entre seguridad y rendimiento
    'temp_store': 'MEMORY',    // Usar memoria para temporales
    'mmap_size': 30000000,     // ~30MB para mapeo en memoria
    'cache_size': -2000,       // ~2MB de caché (en kilobytes)
  },
  statements: {
    preparedStatements: true,
    enableQueryCache: true,
  },
};

// Resource monitoring configuration
export const MONITORING_CONFIG = {
  defaultSamplingRate: 5000, // ms
  lowActivitySamplingRate: 15000, // ms
  batteryThresholds: {
    low: 30, // percentage
    critical: 15, // percentage
  },
  resourceThresholds: {
    cpu: {
      high: 80, // percentage
      critical: 95, // percentage
    },
    memory: {
      high: 70, // percentage
      critical: 90, // percentage
    },
  },
};