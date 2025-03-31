// Tipos de eventos del sistema
export enum SystemEventType {
  // Eventos del ciclo de vida de la aplicación
  APP_READY = 'app:ready',
  APP_WILL_CLOSE = 'app:willClose',
  APP_FOCUSED = 'app:focused',
  APP_BLURRED = 'app:blurred',
  
  // Eventos de configuración
  CONFIG_CHANGED = 'config:changed',
  PREFERENCES_UPDATED = 'preferences:updated',
  ENERGY_MODE_CHANGED = 'energyMode:changed',
  
  // Eventos de estado del sistema
  BATTERY_STATUS_CHANGED = 'battery:statusChanged',
  CONNECTIVITY_CHANGED = 'connectivity:changed',
  RESOURCE_THRESHOLD_REACHED = 'resource:thresholdReached',
  
  // Alertas y errores del sistema
  SYSTEM_ALERT = 'system:alert',
  SYSTEM_ERROR = 'system:error',
}

// Eventos relacionados con documentos
export enum DocumentEventType {
  // Eventos CRUD básicos
  DOCUMENT_CREATED = 'document:created',
  DOCUMENT_LOADED = 'document:loaded',
  DOCUMENT_UPDATED = 'document:updated',
  DOCUMENT_SAVED = 'document:saved',
  DOCUMENT_DELETED = 'document:deleted',
  
  // Eventos de edición
  DOCUMENT_CONTENT_CHANGED = 'document:contentChanged',
  DOCUMENT_METADATA_UPDATED = 'document:metadataUpdated',
  
  // Eventos de selección y navegación
  DOCUMENT_SELECTED = 'document:selected',
  DOCUMENT_PATH_CHANGED = 'document:pathChanged',
  
  // Eventos de importación
  DOCUMENT_IMPORTED = 'document:imported',
  
  // Eventos de versiones
  VERSION_CREATED = 'version:created',
  VERSION_RESTORED = 'version:restored',
  
  // Eventos de carga progresiva
  DOCUMENT_CONTENT_LOADED = 'document:contentLoaded',
  DOCUMENT_CONTENT_PROGRESS = 'document:contentProgress',
}

// Eventos relacionados con la interfaz de usuario
export enum UIEventType {
  // Eventos de editor
  EDITOR_MODE_CHANGED = 'editor:modeChanged',
  EDITOR_FOCUS_CHANGED = 'editor:focusChanged',
  EDITOR_SELECTION_CHANGED = 'editor:selectionChanged',
  
  // Eventos del visor
  VIEWER_RENDER_COMPLETE = 'viewer:renderComplete',
  VIEWER_THEME_CHANGED = 'viewer:themeChanged',
  
  // Eventos de navegación
  NAVIGATION_FOLDER_OPENED = 'navigation:folderOpened',
  NAVIGATION_FOLDER_CLOSED = 'navigation:folderClosed',
  SEARCH_PERFORMED = 'search:performed',
  
  // Eventos de interfaz general
  UI_THEME_CHANGED = 'ui:themeChanged',
  UI_LAYOUT_CHANGED = 'ui:layoutChanged',
  UI_COMPONENT_LOADED = 'ui:componentLoaded',
}

// Eventos relacionados con sincronización y control de versiones
export enum SyncEventType {
  SYNC_STARTED = 'sync:started',
  SYNC_COMPLETED = 'sync:completed',
  SYNC_FAILED = 'sync:failed',
  SYNC_PROGRESS = 'sync:progress',
  CONFLICT_DETECTED = 'sync:conflictDetected',
  CONFLICT_RESOLVED = 'sync:conflictResolved',
  REPOSITORY_CONNECTED = 'repository:connected',
  REPOSITORY_DISCONNECTED = 'repository:disconnected',
}

// Eventos relacionados con almacenamiento
export enum StorageEventType {
  STORAGE_INITIALIZED = 'storage:initialized',
  STORAGE_ERROR = 'storage:error',
  STORAGE_BATCH_PROCESSED = 'storage:batch:processed',
  STORAGE_OPTIMIZED = 'storage:optimized',
  STORAGE_ENERGY_MODE_CHANGED = 'storage:energy_mode:changed',
  DOCUMENT_SAVED = 'storage:document:saved',
  DOCUMENT_DELETED = 'storage:document:deleted',
}

// Eventos relacionados con control de versiones
export enum VersionControlEventType {
  VERSION_CONTROL_INITIALIZED = 'version:initialized',
  VERSION_CONTROL_ERROR = 'version:error',
  VERSION_CREATED = 'version:created',
  VERSION_RESTORED = 'version:restored',
  VERSION_CONTROL_ENERGY_MODE_CHANGED = 'version:energy_mode:changed',
  GIT_COMMIT_CREATED = 'version:git:commit_created',
  GIT_SYNC_COMPLETED = 'version:git:sync_completed',
  GIT_SYNC_ERROR = 'version:git:sync_error',
}

// Eventos relacionados con sostenibilidad
export enum SustainabilityEventType {
  METRICS_UPDATED = 'sustainability:metricsUpdated',
  OPTIMIZATION_SUGGESTED = 'sustainability:optimizationSuggested',
  ENERGY_SAVINGS_REPORTED = 'sustainability:energySavingsReported',
  RESOURCE_USAGE_HIGH = 'sustainability:resourceUsageHigh',
  ENERGY_MODE_TRIGGERED = 'sustainability:energyModeTriggered',
  CONFIG_AUTOSAVE_INTERVAL_CHANGED = 'config:autosaveIntervalChanged',
  UI_RENDER_OPTIMIZATION_CHANGED = 'ui:renderOptimizationChanged',
  AI_CONFIG_CHANGED = 'ai:configChanged',
  SYSTEM_CACHE_TTL_CHANGED = 'system:cacheTTLChanged',
  NETWORK_DATA_SENT = 'network:dataSent',
  NETWORK_DATA_RECEIVED = 'network:dataReceived'
}

// Eventos relacionados con AI Asistant
export enum AIEventType {
  AI_SUGGESTION_READY = 'ai:suggestionReady',
  AI_PROCESSING_STARTED = 'ai:processingStarted',
  AI_PROCESSING_COMPLETED = 'ai:processingCompleted',
  AI_PROCESSING_FAILED = 'ai:processingFailed',
  AI_MODE_CHANGED = 'ai:modeChanged',
}

// Unión de todos los tipos de eventos para uso general
export type EventType = 
  | SystemEventType
  | DocumentEventType
  | UIEventType
  | SyncEventType
  | StorageEventType
  | VersionControlEventType
  | SustainabilityEventType
  | AIEventType;

// Tipos de datos específicos para eventos
export interface EventData {
  // Eventos del sistema
  [SystemEventType.RESOURCE_THRESHOLD_REACHED]: {
    resourceType: 'cpu' | 'memory' | 'disk' | 'battery';
    currentValue: number;
    threshold: number;
  };
  [SystemEventType.BATTERY_STATUS_CHANGED]: {
    level: number;
    isCharging?: boolean;
    charging?: boolean;
    isLow?: boolean;
  };
  [SystemEventType.APP_READY]: undefined;
  [SystemEventType.APP_WILL_CLOSE]: undefined;
  [SystemEventType.APP_FOCUSED]: undefined;
  [SystemEventType.APP_BLURRED]: undefined;
  [SystemEventType.CONNECTIVITY_CHANGED]: {
    online: boolean;
  };
  [SystemEventType.ENERGY_MODE_CHANGED]: {
    previousMode?: string; 
    currentMode: string;
    isAutomatic?: boolean;
    configApplied?: Record<string, any>;
    mode?: string;
  };
  [SystemEventType.SYSTEM_ERROR]: {
    message: string;
    stack?: string;
    timestamp: string;
  };
  [SystemEventType.SYSTEM_ALERT]: {
    type: string;
    message: string;
    level?: 'info' | 'warning' | 'error';
  };
  [SystemEventType.CONFIG_CHANGED]: {
    key: string;
    value: any;
    previousValue?: any;
  };
  [SystemEventType.PREFERENCES_UPDATED]: {
    preferences: Partial<any>;
  };
  
  // Eventos de documento
  [DocumentEventType.DOCUMENT_CONTENT_CHANGED]: {
    documentId: string;
    changeSize: number; // en bytes
    changeType: 'addition' | 'deletion' | 'modification';
    isAutosave?: boolean;
  };
  [DocumentEventType.DOCUMENT_CREATED]: {
    documentId: string;
    path?: string;
    metadata?: Record<string, any>;
  };
  [DocumentEventType.DOCUMENT_LOADED]: {
    documentId: string;
    path?: string;
    size?: number;
  };
  [DocumentEventType.DOCUMENT_UPDATED]: {
    documentId: string;
    changeType: 'metadata' | 'content' | 'both';
  };
  [DocumentEventType.DOCUMENT_SAVED]: {
    documentId: string;
    path: string;
    size: number;
    isAutosave?: boolean;
  };
  [DocumentEventType.DOCUMENT_DELETED]: {
    documentId: string;
    path?: string;
  };
  [DocumentEventType.DOCUMENT_SELECTED]: {
    documentId: string;
  };
  [DocumentEventType.DOCUMENT_PATH_CHANGED]: {
    documentId: string;
    oldPath: string;
    newPath: string;
  };
  [DocumentEventType.DOCUMENT_METADATA_UPDATED]: {
    documentId: string;
    metadata: Record<string, any>;
  };
  [DocumentEventType.DOCUMENT_IMPORTED]: {
    documentId: string;
    sourcePath: string;
    format: string;
  };
  [DocumentEventType.DOCUMENT_CONTENT_LOADED]: {
    documentId: string;
    contentSize: number;
  };
  [DocumentEventType.DOCUMENT_CONTENT_PROGRESS]: {
    documentId: string;
    progress: number; // 0-100
    bytesLoaded: number;
    bytesTotal: number;
  };
  [DocumentEventType.VERSION_CREATED]: {
    documentId: string;
    versionId: string;
    comment?: string;
  };
  [DocumentEventType.VERSION_RESTORED]: {
    documentId: string;
    versionId: string;
  };
  
  // Eventos de sostenibilidad
  [SustainabilityEventType.METRICS_UPDATED]: {
    cpu?: number | { current: number; average: number; peak: number };
    memory?: { used: number; total: number; percentage: number };
    network?: { sent: number; received: number };
    battery?: { level: number; charging: boolean };
    energy?: { current: number; total: number };
    batteryImpact?: 'high' | 'normal' | 'low';
    session?: {
      duration: number;
      totalEnergyUsed: number;
      energySaved: number;
      dataTransferred: { sent: number; received: number; saved: number };
    };
    [key: string]: any;
  };
  [SustainabilityEventType.ENERGY_MODE_TRIGGERED]: {
    mode: string;
    reason: string;
    automatic: boolean;
  };
  [SustainabilityEventType.CONFIG_AUTOSAVE_INTERVAL_CHANGED]: {
    interval: number;
  };
  [SustainabilityEventType.UI_RENDER_OPTIMIZATION_CHANGED]: {
    level: string;
    animations: boolean;
  };
  [SustainabilityEventType.AI_CONFIG_CHANGED]: {
    suggestions: boolean;
  };
  [SustainabilityEventType.SYSTEM_CACHE_TTL_CHANGED]: {
    ttl: number;
  };
  [SustainabilityEventType.NETWORK_DATA_SENT]: {
    bytes: number;
    optimizedBytes: number;
  };
  [SustainabilityEventType.NETWORK_DATA_RECEIVED]: {
    bytes: number;
  };
  [SustainabilityEventType.OPTIMIZATION_SUGGESTED]: {
    type: string;
    suggestion: string;
  };
  [SustainabilityEventType.ENERGY_SAVINGS_REPORTED]: {
    saved: number;
    period: 'session' | 'day' | 'week' | 'month';
    co2Reduction?: number;
  };
  [SustainabilityEventType.RESOURCE_USAGE_HIGH]: {
    resource: 'cpu' | 'memory' | 'disk' | 'network';
    value: number;
    threshold: number;
  };
  
  // Cualquier otro evento
  [key: string]: any;
}