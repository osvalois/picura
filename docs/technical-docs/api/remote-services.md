# Servicios Remotos

## Visi�n General

La arquitectura de servicios remotos de Picura MD proporciona un marco flexible y sostenible para interactuar con servicios externos mientras mantiene los principios fundamentales de procesamiento local prioritario, privacidad y eficiencia energ�tica. Este documento detalla los mecanismos para integraci�n con servicios en la nube, APIs externas y sistemas de sincronizaci�n.

## Arquitectura de Servicios Remotos

### Diagrama de Componentes

```
+------------------------------------------------------------------+
|                                                                  |
|                ARQUITECTURA DE SERVICIOS REMOTOS                 |
|                                                                  |
| +------------------------+        +-------------------------+    |
| |                        |        |                         |    |
| |  Remote Service        |        |  Connectivity Manager   |    |
| |  Manager               |        |                         |    |
| |  - ServiceRegistry     |        |  - NetworkMonitor       |    |
| |  - ConnectionPool      |<------>|  - AdaptiveTransport    |    |
| |  - RequestScheduler    |        |  - BandwidthManager     |    |
| |  - ResponseCache       |        |  - OfflineDetector      |    |
| |                        |        |                         |    |
| +------------------------+        +-------------------------+    |
|            ^                                  ^                  |
|            |                                  |                  |
|            v                                  v                  |
| +------------------------+        +-------------------------+    |
| |                        |        |                         |    |
| |  Service Adapters      |        |  Security Manager       |    |
| |  - SyncService         |        |                         |    |
| |  - ContentService      |<------>|  - AuthManager          |    |
| |  - AIService           |        |  - TokenStore           |    |
| |  - CollaborationService|        |  - PrivacyGuard         |    |
| |                        |        |  - DataSanitizer        |    |
| +------------------------+        +-------------------------+    |
|                                                                  |
+------------------------------------------------------------------+
                |                             |
                v                             v
    +---------------------+       +------------------------+
    |                     |       |                        |
    | Local Services      |       | External Services      |
    | - Document Core     |       | - Git Repositories     |
    | - Version Control   |       | - Cloud Storage        |
    | - Storage Service   |       | - AI APIs              |
    |                     |       | - Collaboration Tools  |
    +---------------------+       +------------------------+
```

### Componentes Clave

#### Remote Service Manager

Coordina todas las interacciones con servicios remotos:

- **ServiceRegistry**: Registro central de servicios disponibles y su configuraci�n
- **ConnectionPool**: Gesti�n eficiente de conexiones para minimizar sobrecarga
- **RequestScheduler**: Programaci�n inteligente de solicitudes seg�n prioridad y recursos
- **ResponseCache**: Cach� adaptativa para minimizar solicitudes redundantes

#### Connectivity Manager

Gestiona y optimiza las conexiones de red:

- **NetworkMonitor**: Monitoreo del estado y calidad de la conectividad
- **AdaptiveTransport**: Selecci�n de protocolos y par�metros seg�n condiciones
- **BandwidthManager**: Control y optimizaci�n del uso de ancho de banda
- **OfflineDetector**: Detecci�n robusta de estado offline y estrategias de recuperaci�n

#### Service Adapters

Adaptadores espec�ficos para diferentes tipos de servicios:

- **SyncService**: Servicios de sincronizaci�n (Git, propietarios)
- **ContentService**: Servicios de almacenamiento y gesti�n de contenido
- **AIService**: Servicios de inteligencia artificial y procesamiento
- **CollaborationService**: Servicios de colaboraci�n y trabajo en equipo

#### Security Manager

Manejo de seguridad y privacidad para comunicaciones remotas:

- **AuthManager**: Gesti�n de autenticaci�n con servicios remotos
- **TokenStore**: Almacenamiento seguro de credenciales y tokens
- **PrivacyGuard**: Filtrado y protecci�n de informaci�n sensible
- **DataSanitizer**: Sanitizaci�n de datos entrantes y salientes

## Tipos de Servicios Remotos

### Servicios de Sincronizaci�n

Permiten mantener documentos sincronizados entre dispositivos y equipos:

| Servicio | Prop�sito | Optimizaciones |
|----------|-----------|----------------|
| **Git Repositories** | Control de versiones distribuido | Sincronizaci�n diferencial, clonado superficial |
| **Cloud Storage** | Almacenamiento de documentos y recursos | Transferencia delta, compresi�n adaptativa |
| **Custom Sync** | Protocolos personalizados de sincronizaci�n | Optimizado para documentaci�n y metadatos |

### Servicios de IA

Proporcionan capacidades extendidas de procesamiento inteligente:

| Servicio | Prop�sito | Optimizaciones |
|----------|-----------|----------------|
| **Text Analysis** | An�lisis y sugerencias ling��sticas | Procesamiento local prioritario, solicitudes por lotes |
| **Content Enhancement** | Mejoras y generaci�n de contenido | Solicitudes contextuales, cache inteligente |
| **Image Processing** | Procesamiento de im�genes y diagramas | Compresi�n previa, procesamiento adaptativo |

### Servicios de Colaboraci�n

Habilitan el trabajo en equipo sobre documentos:

| Servicio | Prop�sito | Optimizaciones |
|----------|-----------|----------------|
| **Real-time Editing** | Edici�n colaborativa en tiempo real | Transmisi�n diferencial, conflation de eventos |
| **Comments & Reviews** | Sistema de comentarios y revisiones | Sincronizaci�n priorizada, carga bajo demanda |
| **Notifications** | Alertas y notificaciones de equipo | Agrupaci�n, priorizaci�n contextual |

### Servicios de Publicaci�n

Facilitan la publicaci�n y distribuci�n de documentaci�n:

| Servicio | Prop�sito | Optimizaciones |
|----------|-----------|----------------|
| **Web Publishing** | Publicaci�n como sitios web | Generaci�n incremental, optimizaci�n de recursos |
| **PDF Generation** | Exportaci�n a formatos ricos | Renderizado en servidor para documentos complejos |
| **Content Delivery** | Distribuci�n optimizada de contenido | CDN, compresi�n avanzada |

## APIs de Servicios Remotos

### API Principal

La interfaz central para interactuar con servicios remotos:

```typescript
interface IRemoteServiceManager {
  // Gesti�n de servicios
  getServices(): RemoteServiceInfo[];
  getService<T extends RemoteService>(id: string): T | null;
  registerService(service: RemoteServiceDefinition): Promise<boolean>;
  unregisterService(id: string): Promise<boolean>;
  
  // Estado y configuraci�n
  getConnectivityStatus(): ConnectivityStatus;
  getServiceStatus(serviceId: string): ServiceStatus;
  configureService(serviceId: string, config: ServiceConfig): Promise<void>;
  
  // Operaciones globales
  enableOfflineMode(enable: boolean): Promise<void>;
  setSyncPriorities(priorities: SyncPrioritySettings): Promise<void>;
  applyBandwidthPolicy(policy: BandwidthPolicy): Promise<void>;
  
  // Estad�sticas y m�tricas
  getUsageStats(): RemoteUsageStats;
  
  // Eventos
  on(event: RemoteServiceEvent, handler: EventHandler): Unsubscribe;
}

// Tipos de servicio base
interface RemoteService {
  readonly id: string;
  readonly name: string;
  readonly type: RemoteServiceType;
  readonly status: ServiceStatus;
  
  // M�todos comunes
  connect(): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  getCapabilities(): ServiceCapability[];
  getStatus(): ServiceStatus;
  configure(config: ServiceConfig): Promise<void>;
}

// Estado de conectividad
interface ConnectivityStatus {
  online: boolean;
  networkType?: 'wifi' | 'ethernet' | 'cellular' | 'other';
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  metered?: boolean;
  bandwidthEstimate?: number; // kbps
  latencyEstimate?: number; // ms
  restrictions?: string[];
}
```

### API de Sincronizaci�n Remota

```typescript
interface RemoteSyncService extends RemoteService {
  // Operaciones de sincronizaci�n
  sync(options?: SyncOptions): Promise<SyncResult>;
  push(target: string, options?: PushOptions): Promise<PushResult>;
  pull(source: string, options?: PullOptions): Promise<PullResult>;
  
  // Gesti�n de contenido
  getRemoteItems(path: string, options?: ListOptions): Promise<RemoteItem[]>;
  getItemMetadata(id: string): Promise<RemoteItemMetadata>;
  
  // Conflictos
  getConflicts(): Promise<SyncConflict[]>;
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<boolean>;
  
  // Programaci�n
  getSyncSchedule(): SyncSchedule;
  setSyncSchedule(schedule: SyncSchedule): Promise<void>;
}

// Opciones de sincronizaci�n
interface SyncOptions {
  mode?: 'two-way' | 'upload-only' | 'download-only';
  scope?: 'all' | 'documents' | 'specific';
  items?: string[];
  priorities?: SyncPrioritySettings;
  conflictStrategy?: ConflictStrategy;
  bandwidth?: BandwidthPolicy;
  dryRun?: boolean;
}

// Configuraci�n de programaci�n
interface SyncSchedule {
  enabled: boolean;
  mode: 'interval' | 'specific-times' | 'events';
  interval?: number; // minutos
  times?: string[]; // formato HH:MM
  events?: ('document-saved' | 'application-idle' | 'network-available')[];
  constraints?: {
    networkType?: ('wifi' | 'ethernet' | 'cellular')[];
    minBatteryLevel?: number;
    requireCharging?: boolean;
    minIdleTime?: number; // minutos
  };
}
```

### API de Servicios de IA

```typescript
interface RemoteAIService extends RemoteService {
  // Capacidades
  getSupportedOperations(): AIOperation[];
  
  // Operaciones ling��sticas
  analyzeText(text: string, analysisType: TextAnalysisType): Promise<TextAnalysisResult>;
  suggestImprovements(text: string, options?: ImprovementOptions): Promise<TextSuggestion[]>;
  generateContent(prompt: string, options?: GenerationOptions): Promise<GeneratedContent>;
  
  // Operaciones visuales
  analyzeImage(imageData: Blob, analysisType: ImageAnalysisType): Promise<ImageAnalysisResult>;
  generateImage(description: string, options?: ImageGenerationOptions): Promise<Blob>;
  
  // Configuraci�n
  setProcessingPreferences(preferences: AIProcessingPreferences): Promise<void>;
  
  // Local vs remoto
  getProcessingLocation(operation: AIOperation): ProcessingLocation;
  setProcessingLocation(operation: AIOperation, location: PreferredProcessingLocation): Promise<boolean>;
}

// Preferencias de procesamiento
interface AIProcessingPreferences {
  qualityLevel: 'draft' | 'standard' | 'high';
  responseTime: 'fastest' | 'balanced' | 'best-quality';
  privacyLevel: 'max-privacy' | 'balanced' | 'max-quality';
  resourceUsage: 'minimal' | 'balanced' | 'unrestricted';
  modelPreferences?: {
    preferredModels?: string[];
    excludedModels?: string[];
    minimumAccuracy?: number;
  };
}

// Ubicaci�n de procesamiento
type ProcessingLocation = 'local' | 'remote' | 'hybrid';
type PreferredProcessingLocation = ProcessingLocation | 'auto';
```

### API de Colaboraci�n

```typescript
interface RemoteCollaborationService extends RemoteService {
  // Sesiones colaborativas
  createSession(documentId: string, options?: CollaborationOptions): Promise<CollaborationSession>;
  joinSession(sessionId: string): Promise<CollaborationSession>;
  listActiveSessions(): Promise<SessionInfo[]>;
  
  // Comentarios y revisiones
  getComments(documentId: string): Promise<Comment[]>;
  addComment(documentId: string, comment: NewComment): Promise<Comment>;
  resolveComment(commentId: string, resolution?: CommentResolution): Promise<boolean>;
  
  // Usuarios y presencia
  getActiveUsers(sessionId: string): Promise<UserPresence[]>;
  updateUserStatus(status: UserStatus): Promise<void>;
  
  // Permisos
  getDocumentPermissions(documentId: string): Promise<DocumentPermissions>;
  updatePermissions(documentId: string, permissions: PermissionChanges): Promise<DocumentPermissions>;
}

// Sesi�n colaborativa
interface CollaborationSession {
  readonly id: string;
  readonly document: { id: string, name: string };
  readonly users: UserPresence[];
  readonly startedAt: string;
  
  // Comunicaci�n en tiempo real
  sendOperation(operation: CollaborativeOperation): Promise<void>;
  onOperation(callback: (operation: CollaborativeOperation) => void): Unsubscribe;
  
  // Presencia y cursores
  updateCursor(position: CursorPosition): Promise<void>;
  onCursorUpdate(callback: (update: CursorUpdate) => void): Unsubscribe;
  
  // Gesti�n de sesi�n
  setUserState(state: Partial<UserState>): Promise<void>;
  leaveSession(): Promise<void>;
}
```

## Autenticaci�n y Autorizaci�n

### Modelo de Autenticaci�n

Picura MD soporta m�ltiples estrategias de autenticaci�n para servicios externos:

```typescript
interface IAuthManager {
  // Proveedores de autenticaci�n
  getAuthProviders(): AuthProvider[];
  registerAuthProvider(provider: AuthProviderDefinition): Promise<boolean>;
  
  // Flujos de autenticaci�n
  authenticate(provider: string, options?: AuthOptions): Promise<AuthResult>;
  refreshAuth(provider: string): Promise<AuthResult>;
  
  // Gesti�n de tokens
  getTokens(provider: string): Promise<TokenInfo[]>;
  revokeToken(provider: string, tokenId: string): Promise<boolean>;
  
  // Estado
  getAuthStatus(provider: string): AuthStatus;
  
  // Seguridad
  securelyStoreCredentials(provider: string, credentials: any): Promise<string>;
}

// Opciones de autenticaci�n
interface AuthOptions {
  scopes?: string[];
  interactive?: boolean;
  silent?: boolean;
  forceNewSession?: boolean;
  extraParams?: Record<string, string>;
}

// Resultado de autenticaci�n
interface AuthResult {
  success: boolean;
  provider: string;
  userId?: string;
  tokenInfo?: TokenInfo;
  error?: AuthError;
}

// Informaci�n de token
interface TokenInfo {
  id: string;
  token: string; // Valor real puede estar encriptado
  type: 'bearer' | 'basic' | 'apikey' | 'oauth' | 'other';
  scopes: string[];
  expiresAt?: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
}
```

### Flujos de Autenticaci�n

```typescript
// Configuraci�n de proveedor OAuth
remoteServiceManager.registerAuthProvider({
  id: 'github-oauth',
  name: 'GitHub',
  type: 'oauth2',
  
  // Configuraci�n OAuth
  clientId: 'your-client-id',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  redirectUri: 'picura://auth/callback',
  
  // Scopes disponibles
  scopes: {
    'repo': 'Access to private repositories',
    'user': 'Read user profile information',
    'gist': 'Create and edit gists'
  },
  
  // Flujo personalizado
  async startFlow(options) {
    // Implementar flujo espec�fico para GitHub
    if (options.silent && this.hasStoredRefreshToken()) {
      // Intentar refresh silencioso
      return this.refreshSilently();
    }
    
    // Flujo interactivo requiriendo autorizaci�n del usuario
    const authUrl = this.buildAuthorizationUrl(options.scopes);
    
    if (options.interactive) {
      return picura.ui.showAuthWindow(authUrl);
    } else {
      return { success: false, error: { code: 'user_interaction_required' } };
    }
  },
  
  // Gesti�n de tokens
  async parseResponse(responseData) {
    // Procesar respuesta de GitHub
    const tokenInfo = {
      id: generateId(),
      token: responseData.access_token,
      type: 'bearer',
      scopes: responseData.scope.split(','),
      expiresAt: calculateExpiry(responseData.expires_in)
    };
    
    // Almacenar de forma segura
    await this.securelyStoreToken(tokenInfo);
    
    return { success: true, tokenInfo };
  }
});

// Uso de la autenticaci�n
const authenticateWithGitHub = async () => {
  const authManager = await picura.services.getAuthManager();
  
  // Verificar si hay autenticaci�n existente
  const currentStatus = await authManager.getAuthStatus('github-oauth');
  
  if (currentStatus.authenticated && !currentStatus.expired) {
    // Ya autenticado
    return currentStatus;
  }
  
  // Intentar renovaci�n silenciosa primero
  if (currentStatus.canRefresh) {
    try {
      const refreshResult = await authManager.refreshAuth('github-oauth');
      if (refreshResult.success) {
        return refreshResult;
      }
    } catch (error) {
      console.log('Silent refresh failed, proceeding with interactive auth');
    }
  }
  
  // Autenticaci�n interactiva
  const authResult = await authManager.authenticate('github-oauth', {
    scopes: ['repo', 'user'],
    interactive: true
  });
  
  if (authResult.success) {
    // Registrar servicio con nueva autenticaci�n
    await configureGitHubServices(authResult.tokenInfo);
  } else {
    throw new Error(`Authentication failed: ${authResult.error?.message}`);
  }
  
  return authResult;
};
```

## Estrategias de Sincronizaci�n Eficiente

### Sincronizaci�n Adaptativa

Picura MD implementa estrategias adaptativas para minimizar el consumo de recursos:

```typescript
// Configuraci�n de sincronizaci�n adaptativa
const configureSyncStrategy = async () => {
  const syncService = await picura.services.getRemoteService('document-sync');
  
  // Configurar estrategia adaptativa
  await syncService.configure({
    // Estrategias de transferencia
    transferStrategy: {
      compressionLevel: 'adaptive', // adaptar seg�n red
      batchingStrategy: 'intelligent', // agrupar operaciones similares
      deltaEncoding: true, // enviar solo cambios
      prioritization: {
        active: 'highest',
        recent: 'high',
        referenced: 'medium',
        other: 'low'
      }
    },
    
    // Adaptaci�n seg�n conectividad
    networkAdaptation: {
      metered: {
        syncMode: 'essential-only',
        compressionLevel: 'maximum',
        deferLargeTransfers: true,
        mediaStrategy: 'on-demand'
      },
      limited: {
        maxConcurrentTransfers: 1,
        timeoutMultiplier: 2.0,
        retryStrategy: 'aggressive',
        batchSize: 'small'
      },
      unlimited: {
        maxConcurrentTransfers: 5,
        prefetchStrategy: 'predictive',
        compressionLevel: 'balanced'
      }
    },
    
    // Estrategias seg�n energ�a
    energyAdaptation: {
      critical: {
        enabled: false, // desactivar sincronizaci�n
        manualOnly: true
      },
      low: {
        syncMode: 'manual-only',
        conflictResolution: 'defer',
        batchSize: 'minimal'
      },
      normal: {
        syncMode: 'scheduled',
        conflictResolution: 'auto-simple',
        batchSize: 'medium'
      },
      charging: {
        syncMode: 'aggressive',
        conflictResolution: 'auto-all',
        batchSize: 'large',
        includeDormant: true
      }
    }
  });
  
  // Configurar programaci�n inteligente
  await syncService.setSyncSchedule({
    enabled: true,
    mode: 'events',
    events: ['document-saved', 'app-idle', 'network-change'],
    constraints: {
      networkType: ['wifi', 'ethernet'],
      minBatteryLevel: 30,
      requireCharging: false,
      minIdleTime: 5 // minutos
    },
    intelligent: {
      learnFromUsage: true,
      predictIdlePeriods: true,
      detectLowUsageTimes: true
    }
  });
  
  return syncService;
};
```

### Optimizaci�n de Transferencia

```typescript
// Configuraci�n de optimizaciones de transferencia
const configureTransferOptimizations = async () => {
  const connectivityManager = await picura.services.getConnectivityManager();
  
  // Aplicar optimizaciones globales
  await connectivityManager.configureTransfers({
    // Compresi�n adaptativa
    compression: {
      text: { algorithm: 'zlib', level: 'adaptive' },
      images: { enabled: true, quality: 'adaptive' },
      binary: { algorithm: 'zstd', level: 'adaptive' }
    },
    
    // Estrategias de cach�
    caching: {
      strategy: 'two-tier',
      memoryCache: {
        maxSize: '50MB',
        ttl: '1h',
        priorityFunction: 'frequency-and-recency'
      },
      persistentCache: {
        maxSize: '200MB',
        ttl: '7d',
        cleanupStrategy: 'lru-with-expiry'
      }
    },
    
    // Estrategias de batch
    batching: {
      enabled: true,
      maxBatchSize: '500KB',
      maxBatchDelay: '2s',
      intelligent: true,
      dynamicSizing: true
    },
    
    // Estrategias de retry
    retryStrategy: {
      maxRetries: 5,
      initialDelay: 500,
      backoffFactor: 1.5,
      jitter: true,
      timeoutStrategy: 'adaptive'
    },
    
    // Control de ancho de banda
    bandwidthControl: {
      enabled: true,
      ceilings: {
        metered: '50KB/s',
        limited: '200KB/s',
        unlimited: '1MB/s'
      },
      adaptiveCongestionControl: true,
      fairSharing: true
    }
  });
  
  return connectivityManager;
};
```

### Modo Offline

```typescript
// Configuraci�n de capacidades offline
const configureOfflineCapabilities = async () => {
  const offlineManager = await picura.services.getOfflineManager();
  
  // Configurar modo offline
  await offlineManager.configure({
    // Detecci�n de conectividad
    detection: {
      mode: 'aggressive', // detectar problemas temprano
      pingInterval: 60, // segundos
      requiredEndpoints: ['primary', 'backup'],
      qualityMetrics: true
    },
    
    // Comportamiento offline
    offlineBehavior: {
      autoSwitchToOffline: true,
      notifyUser: true,
      continueQueueing: true,
      localFirstStrategy: true
    },
    
    // Sincronizaci�n offline
    offlineSync: {
      queueOperations: true,
      persistQueue: true,
      intelligentMergeOnReconnect: true,
      priorityReconnect: {
        critical: true,
        timeSensitive: true
      }
    },
    
    // Preparaci�n para offline
    offlinePreparation: {
      predictiveDownload: true,
      prefetchLinkedDocuments: true,
      prefetchReferencedAssets: true,
      downloadPriorities: {
        currentDocument: 'essential',
        openRecently: 'high',
        linked: 'medium',
        starred: 'medium',
        other: 'low'
      }
    }
  });
  
  // Configurar eventos de conectividad
  offlineManager.on('connectivity-changed', async (status) => {
    // Adaptar comportamiento seg�n cambio de conectividad
    if (status.online && status.previousState === 'offline') {
      // Reconectado - sincronizar cambios pendientes
      await syncPendingChanges(status);
    } else if (!status.online) {
      // Desconectado - prepararse para trabajo offline
      await prepareForOfflineWork();
    }
  });
  
  return offlineManager;
};

// Sincronizaci�n inteligente al reconectar
const syncPendingChanges = async (connectivityStatus) => {
  const syncService = await picura.services.getRemoteService('document-sync');
  
  // Obtener operaciones pendientes
  const pendingOperations = await syncService.getPendingOperations();
  
  // Clasificar por prioridad
  const criticalOps = pendingOperations.filter(op => op.priority === 'critical');
  const highOps = pendingOperations.filter(op => op.priority === 'high');
  const normalOps = pendingOperations.filter(op => op.priority === 'normal');
  
  // Adaptaci�n a calidad de red
  const networkQuality = connectivityStatus.networkQuality;
  
  if (networkQuality === 'poor') {
    // Solo sincronizar operaciones cr�ticas
    await syncService.processPendingOperations(criticalOps);
    
    // Notificar al usuario
    picura.ui.showNotification({
      message: `Conexi�n limitada: sincronizados ${criticalOps.length} cambios cr�ticos`,
      type: 'info',
      actions: [
        { label: 'Sincronizar todo', action: () => syncService.syncAll() }
      ]
    });
  } else {
    // Sincronizar por lotes seg�n calidad
    await syncService.processPendingOperations([...criticalOps, ...highOps]);
    
    if (networkQuality === 'good' || networkQuality === 'excellent') {
      await syncService.processPendingOperations(normalOps);
    }
  }
};
```

## Interfaz de Usuario para Servicios Remotos

### Panel de Estado de Sincronizaci�n

Picura MD proporciona componentes de UI para visualizar y controlar la sincronizaci�n:

```typescript
// Creaci�n de panel de sincronizaci�n
const createSyncStatusPanel = async () => {
  // Obtener servicio de sincronizaci�n
  const syncService = await picura.services.getRemoteService('document-sync');
  
  // Crear panel
  const panel = await picura.ui.createPanel({
    id: 'sync-status',
    title: 'Estado de Sincronizaci�n',
    icon: 'sync',
    position: 'right',
    priority: 10,
    
    // Renderizado
    render: async (container) => {
      // Crear estructura base
      container.innerHTML = `
        <div class="sync-status-panel">
          <div class="sync-header">
            <span class="sync-title">Sincronizaci�n</span>
            <div class="sync-status-indicator"></div>
          </div>
          <div class="sync-stats"></div>
          <div class="sync-operations"></div>
          <div class="sync-actions"></div>
        </div>
      `;
      
      // Referencias a elementos
      const statusIndicator = container.querySelector('.sync-status-indicator');
      const statsContainer = container.querySelector('.sync-stats');
      const operationsContainer = container.querySelector('.sync-operations');
      const actionsContainer = container.querySelector('.sync-actions');
      
      // Actualizar estado inicial
      await updateSyncStatus();
      
      // Suscribirse a cambios
      const unsubscribe = syncService.on('status-changed', updateSyncStatus);
      
      // Configurar acciones
      setupSyncActions(actionsContainer);
      
      // Funci�n de actualizaci�n
      async function updateSyncStatus() {
        // Obtener estado actual
        const status = await syncService.getStatus();
        const stats = await syncService.getStatistics();
        
        // Actualizar indicador de estado
        updateStatusIndicator(statusIndicator, status);
        
        // Actualizar estad�sticas
        statsContainer.innerHTML = `
          <div class="stat-row">
            <span>�ltimo sync:</span>
            <span>${formatDateTime(status.lastSyncTime)}</span>
          </div>
          <div class="stat-row">
            <span>Documentos sincronizados:</span>
            <span>${stats.syncedDocuments}</span>
          </div>
          <div class="stat-row">
            <span>Pendientes:</span>
            <span>${status.pendingOperations}</span>
          </div>
          <div class="stat-row sustainability-metric">
            <span>Datos ahorrados:</span>
            <span>${formatBytes(stats.dataSaved)}</span>
          </div>
        `;
        
        // Actualizar operaciones en curso
        updateOperationsList(operationsContainer, status.activeOperations);
      }
      
      // Limpiar suscripciones al cerrar
      return () => {
        unsubscribe();
      };
    }
  });
  
  return panel;
};

// Configuraci�n de acciones de sincronizaci�n
const setupSyncActions = (container) => {
  // Crear botones de acci�n
  container.innerHTML = `
    <button class="action-button sync-now">
      <span class="icon">�</span>
      <span>Sincronizar Ahora</span>
    </button>
    <button class="action-button configure-sync">
      <span class="icon">�</span>
      <span>Configurar</span>
    </button>
  `;
  
  // Eventos para botones
  container.querySelector('.sync-now').addEventListener('click', async () => {
    const syncService = await picura.services.getRemoteService('document-sync');
    
    // Verificar recursos antes de sincronizar
    const resources = await picura.sustainability.getResourceStatus();
    
    // Adaptar sincronizaci�n seg�n recursos
    const syncOptions = {};
    
    if (resources.batteryLevel < 0.2 && !resources.charging) {
      const proceed = await picura.ui.confirm({
        title: 'Bater�a baja',
        message: 'La sincronizaci�n puede consumir energ�a. �Desea continuar?',
        confirmLabel: 'Sincronizar',
        cancelLabel: 'Cancelar'
      });
      
      if (!proceed) return;
      
      // Sincronizaci�n m�nima para conservar bater�a
      syncOptions.mode = 'essential-only';
      syncOptions.optimizeForBattery = true;
    }
    
    // Ejecutar sincronizaci�n
    try {
      await syncService.sync(syncOptions);
      
      picura.ui.showNotification({
        message: 'Sincronizaci�n completada',
        type: 'success'
      });
    } catch (error) {
      picura.ui.showNotification({
        message: `Error de sincronizaci�n: ${error.message}`,
        type: 'error'
      });
    }
  });
  
  container.querySelector('.configure-sync').addEventListener('click', async () => {
    await picura.ui.showDialog('sync-configuration');
  });
};
```

### Indicadores de Estado de Conexi�n

```typescript
// Configuraci�n de indicador de estado de conexi�n
const setupConnectivityIndicator = async () => {
  const connectivityManager = await picura.services.getConnectivityManager();
  
  // Crear indicador en barra de estado
  const indicator = await picura.ui.statusBar.addItem({
    id: 'connectivity-status',
    priority: 100,
    alignment: 'right',
    
    // Renderizado adaptativo
    render: () => {
      const status = connectivityManager.getStatus();
      
      if (!status.online) {
        return {
          text: '$(offline) Offline',
          tooltip: 'Trabajando sin conexi�n',
          color: '#e74c3c',
          command: 'connectivity.showStatus'
        };
      }
      
      if (status.metered) {
        return {
          text: '$(metered) Red medida',
          tooltip: `Conexi�n medida: ${getNetworkTypeName(status.networkType)}`,
          color: '#e67e22',
          command: 'connectivity.showStatus'
        };
      }
      
      if (status.limited || status.networkQuality === 'poor') {
        return {
          text: '$(limited) Limitada',
          tooltip: `Conexi�n limitada: ${status.limitations.join(', ')}`,
          color: '#f39c12',
          command: 'connectivity.showStatus'
        };
      }
      
      return {
        text: `$(online) ${getNetworkTypeName(status.networkType)}`,
        tooltip: `Conectado: ${getNetworkQualityDesc(status.networkQuality)}`,
        color: '#2ecc71',
        command: 'connectivity.showStatus'
      };
    }
  });
  
  // Registrar comando para mostrar detalles
  picura.commands.register('connectivity.showStatus', async () => {
    const status = connectivityManager.getStatus();
    const metrics = await connectivityManager.getDetailedMetrics();
    
    await picura.ui.showPanel('connectivity-details', {
      status,
      metrics
    });
  });
  
  // Actualizar cuando cambie estado
  connectivityManager.on('status-changed', () => {
    indicator.update();
  });
  
  return indicator;
};
```

## Pol�ticas de Sostenibilidad para Servicios Remotos

### Estrategias de Conservaci�n de Energ�a

```typescript
// Configuraci�n de pol�ticas de conservaci�n de energ�a
const configureEnergySavingPolicies = async () => {
  const resourceManager = await picura.services.getResourceManager();
  
  // Configurar pol�ticas seg�n estado de energ�a
  await resourceManager.configurePolicies({
    // Modo cr�tico (bater�a muy baja)
    critical: {
      batteryThreshold: 10, // 10% o menos
      
      remoteServices: {
        syncEnabled: false,
        aiEnabled: false,
        collaborationEnabled: false,
        periodicTasksEnabled: false,
        manualOverrideAllowed: true,
        userNotification: true
      },
      
      networkUsage: {
        mode: 'minimal',
        mobileDataDisabled: true,
        backgroundTransfersDisabled: true,
        cacheTTLExtended: true
      },
      
      adaptations: {
        compressionLevel: 'maximum',
        renderingQuality: 'minimal',
        prefetchingDisabled: true,
        pollIntervalMultiplier: 5
      }
    },
    
    // Modo de ahorro (bater�a baja)
    saving: {
      batteryThreshold: 30, // 30% o menos
      
      remoteServices: {
        syncEnabled: 'manual',
        aiEnabled: 'local-only',
        collaborationEnabled: 'essential',
        periodicTasksReduced: true,
        adaptiveScheduling: true
      },
      
      networkUsage: {
        mode: 'conservative',
        mobileDataRestricted: true,
        prioritizeEssentialTraffic: true,
        batchingAggressive: true
      },
      
      adaptations: {
        compressionLevel: 'high',
        renderingQuality: 'reduced',
        prefetchingLimited: true,
        pollIntervalMultiplier: 2
      }
    },
    
    // Modo normal (bater�a adecuada)
    normal: {
      batteryThreshold: 100, // Cualquier nivel
      
      remoteServices: {
        syncEnabled: 'scheduled',
        aiEnabled: 'hybrid',
        collaborationEnabled: true,
        periodicTasksNormal: true
      },
      
      networkUsage: {
        mode: 'balanced',
        mobileDataAllowed: true,
        intelligentTrafficShaping: true
      },
      
      adaptations: {
        compressionLevel: 'balanced',
        renderingQuality: 'standard',
        prefetchingEnabled: true,
        pollIntervalMultiplier: 1
      }
    },
    
    // Modo conectado (cargando)
    charging: {
      chargingRequired: true,
      
      remoteServices: {
        syncEnabled: 'aggressive',
        aiEnabled: 'full',
        collaborationEnabled: true,
        periodicTasksEnhanced: true,
        proactiveSync: true
      },
      
      networkUsage: {
        mode: 'performance',
        prefetchingAggressive: true,
        highQualityAssetsEnabled: true
      },
      
      adaptations: {
        compressionLevel: 'adaptive',
        renderingQuality: 'high',
        prefetchingAggressive: true,
        pollIntervalMultiplier: 0.5
      }
    }
  });
  
  // Configurar cambios din�micos
  resourceManager.on('policy-changed', async (oldPolicy, newPolicy) => {
    // Notificar al usuario sobre cambio significativo
    if (oldPolicy === 'normal' && newPolicy === 'saving') {
      picura.ui.showNotification({
        message: 'Modo de ahorro de energ�a activado',
        type: 'info',
        transient: true
      });
    } else if (oldPolicy === 'saving' && newPolicy === 'critical') {
      picura.ui.showNotification({
        message: 'Bater�a cr�tica: servicios remotos desactivados',
        type: 'warning'
      });
    }
    
    // Aplicar adaptaciones espec�ficas
    await applyServiceAdaptations(newPolicy);
  });
  
  return resourceManager;
};

// Aplicar adaptaciones espec�ficas a servicios
const applyServiceAdaptations = async (policyName) => {
  // Obtener servicios relevantes
  const services = await picura.services.getRemoteServices();
  
  // Aplicar pol�tica a cada servicio
  for (const service of services) {
    try {
      await service.applyResourcePolicy(policyName);
    } catch (error) {
      console.error(`Error applying policy to ${service.id}:`, error);
    }
  }
  
  // Adaptaciones adicionales espec�ficas por servicio
  if (policyName === 'critical') {
    // Desactivar servicios no esenciales
    await disableNonEssentialServices();
  } else if (policyName === 'charging') {
    // Aprovechar para tareas de mantenimiento
    await scheduleMaintenanceTasks();
  }
};
```

### M�tricas y Monitoreo

```typescript
// Configuraci�n de monitoreo de sostenibilidad para servicios remotos
const setupRemoteServicesMonitoring = async () => {
  const sustainabilityMonitor = await picura.services.getSustainabilityMonitor();
  
  // Configurar m�tricas espec�ficas para servicios remotos
  await sustainabilityMonitor.configureMetrics({
    remoteServices: {
      // M�tricas de red
      networkUsage: {
        totalBytes: true,
        byService: true,
        byEndpoint: true,
        optimizationSavings: true
      },
      
      // M�tricas de energ�a
      energyImpact: {
        estimatedConsumption: true,
        relativeImpact: true,
        historicalTrends: true,
        comparisonBaseline: true
      },
      
      // M�tricas de eficiencia
      efficiency: {
        cacheHitRatio: true,
        compressionRatio: true,
        batchingEfficiency: true,
        retryRate: true
      },
      
      // M�tricas de servicios espec�ficos
      services: {
        sync: {
          transferEfficiency: true,
          conflictRate: true,
          incrementalChanges: true
        },
        ai: {
          localVsRemoteRatio: true,
          inferenceEfficiency: true,
          cacheUtilization: true
        },
        collaboration: {
          messageSize: true,
          presenceEfficiency: true,
          eventCoalescence: true
        }
      }
    }
  });
  
  // Configurar umbrales y alertas
  await sustainabilityMonitor.setThresholds({
    'network.mobileData.daily': {
      warning: 10 * 1024 * 1024, // 10MB
      critical: 50 * 1024 * 1024 // 50MB
    },
    'energy.remoteServices.impact': {
      warning: 0.2, // 20% del consumo total
      critical: 0.5 // 50% del consumo total
    },
    'efficiency.cache.hitRatio': {
      warning: 0.5, // M�nimo 50% hit ratio
      target: 0.8 // Objetivo 80% hit ratio
    }
  });
  
  // Configurar dashboard
  const dashboard = await sustainabilityMonitor.createDashboard('remote-services', {
    title: 'Sostenibilidad de Servicios Remotos',
    refreshInterval: 60, // segundos
    sections: [
      {
        title: 'Resumen de Impacto',
        metrics: ['energy.total', 'network.total', 'efficiency.overall'],
        visualization: 'gauges'
      },
      {
        title: 'Ahorro de Recursos',
        metrics: ['network.saved', 'energy.saved'],
        visualization: 'bar-chart',
        timeRange: 'last-7-days'
      },
      {
        title: 'Eficiencia por Servicio',
        metrics: ['services.*.efficiency'],
        visualization: 'radar-chart'
      },
      {
        title: 'Tendencias Hist�ricas',
        metrics: ['energy.trend', 'network.trend'],
        visualization: 'line-chart',
        timeRange: 'last-30-days'
      }
    ]
  });
  
  return {
    monitor: sustainabilityMonitor,
    dashboard
  };
};
```

## Integraci�n con Servicios Espec�ficos

### APIs en la Nube

```typescript
// Integraci�n con API de servicio en la nube
const integrateWithCloudDocumentAPI = async () => {
  // Registrar adaptador para servicio en la nube
  const cloudApiAdapter = {
    id: 'cloud-document-api',
    name: 'Servicio de Documentos en la Nube',
    type: 'content',
    
    // Estado interno
    client: null,
    
    // Inicializaci�n
    async initialize(config) {
      // Crear cliente con configuraci�n sostenible
      this.client = await createCloudClient({
        baseUrl: config.apiEndpoint,
        authentication: {
          type: config.authType,
          token: await picura.security.getStoredToken('cloud-api')
        },
        
        // Configuraciones sostenibles
        optimizations: {
          caching: true,
          compression: true,
          retryStrategy: 'exponential',
          connectionPooling: true,
          keepAlive: true,
          timeout: 15000,
          rateLimitHandling: 'adaptive'
        }
      });
      
      // Verificar conectividad
      return this.client.testConnection();
    },
    
    // Capacidades
    getCapabilities() {
      return [
        'document.read',
        'document.write',
        'document.list',
        'asset.store',
        'version.history',
        'metadata.query'
      ];
    },
    
    // Operaciones de documentos
    async getDocuments(query) {
      // Adaptar consulta seg�n condiciones actuales
      const adaptedQuery = await this.adaptQueryToConditions(query);
      
      // Ejecutar consulta optimizada
      const result = await this.client.documents.search(adaptedQuery);
      
      // Procesar y cachear resultado
      await this.cacheResults(result, query);
      
      return this.mapToLocalFormat(result);
    },
    
    async getDocument(id, options = {}) {
      // Verificar cach� primero
      const cached = await this.getCachedDocument(id);
      if (cached && !options.forceRefresh) {
        return cached;
      }
      
      // Obtener espec�ficamente los campos requeridos
      const fields = options.fields || 'all';
      
      // Obtener documento con optimizaciones
      const document = await this.client.documents.get(id, {
        fields,
        includeAssets: options.includeAssets || false,
        version: options.version
      });
      
      // Actualizar cach� con nueva informaci�n
      await this.updateCache(id, document);
      
      return document;
    },
    
    async saveDocument(document) {
      // Implementar guardado diferencial si es actualizaci�n
      if (document.id) {
        const diff = await this.generateDiff(document);
        if (Object.keys(diff).length > 0) {
          return this.client.documents.patch(document.id, diff);
        }
        return { id: document.id, unchanged: true };
      }
      
      // Crear nuevo documento
      const result = await this.client.documents.create(document);
      
      // Actualizar cach� con documento creado
      await this.updateCache(result.id, result);
      
      return result;
    },
    
    // M�todos auxiliares
    async adaptQueryToConditions(query) {
      const connectivity = await picura.services.getConnectivityStatus();
      const resources = await picura.sustainability.getResourceStatus();
      
      let adaptedQuery = { ...query };
      
      // Adaptar seg�n recursos
      if (connectivity.metered || resources.batteryLevel < 0.3) {
        // Limitar resultados para ahorrar transferencia
        adaptedQuery.limit = Math.min(query.limit || 50, 20);
        adaptedQuery.fields = this.reduceFieldSet(query.fields);
        adaptedQuery.includeAssets = false;
      }
      
      // Adaptar seg�n l�mites
      if (connectivity.limited || resources.cpuUsage > 0.7) {
        // Simplificar ordenamiento y filtrado
        adaptedQuery.simplifyResponse = true;
      }
      
      return adaptedQuery;
    },
    
    async generateDiff(document) {
      // Obtener versi�n anterior
      const original = await this.getDocument(document.id, { 
        forceRefresh: true,
        fields: 'content,metadata'
      });
      
      // Generar diff optimizado
      return generateOptimizedDiff(original, document);
    }
  };
  
  // Registrar adaptador
  await picura.services.registerRemoteService(cloudApiAdapter);
  
  // Configurar con par�metros espec�ficos
  await picura.services.configureService('cloud-document-api', {
    apiEndpoint: 'https://api.example.com/v1',
    authType: 'oauth',
    synchronizationEnabled: true,
    cacheStrategy: 'aggressive',
    offlineCapability: 'full'
  });
  
  return cloudApiAdapter;
};
```

### Servicios de IA en Nube

```typescript
// Integraci�n con servicios de IA
const integrateWithAIService = async () => {
  // Registrar servicio de IA
  const aiService = {
    id: 'sustainable-ai-service',
    name: 'Asistente IA Sostenible',
    type: 'ai',
    
    // Estado interno
    localModels: new Map(),
    remoteClient: null,
    processingPreferences: null,
    
    // Inicializaci�n
    async initialize(config) {
      // Cargar modelos locales eficientes
      await this.initializeLocalModels();
      
      // Configurar cliente remoto si est� habilitado
      if (config.enableRemote) {
        this.remoteClient = await createAIClient({
          endpoint: config.endpoint,
          apiKey: await picura.security.getStoredToken('ai-service'),
          
          // Configuraciones sostenibles
          optimizations: {
            batchProcessing: true,
            compression: true,
            caching: true,
            timeout: 20000
          }
        });
      }
      
      // Configurar preferencias iniciales
      this.processingPreferences = {
        preferLocal: config.preferLocal || true,
        qualityLevel: config.qualityLevel || 'balanced',
        privacyLevel: config.privacyLevel || 'high',
        resourceUsage: config.resourceUsage || 'balanced'
      };
      
      return {
        localModelsAvailable: this.localModels.size > 0,
        remoteAvailable: !!this.remoteClient
      };
    },
    
    // Capacidades
    getCapabilities() {
      const capabilities = [
        'text.grammar',
        'text.style',
        'text.suggestions',
        'markdown.formatting'
      ];
      
      // A�adir capacidades avanzadas si hay cliente remoto
      if (this.remoteClient) {
        capabilities.push(
          'text.generation',
          'text.summarization',
          'text.translation'
        );
      }
      
      return capabilities;
    },
    
    // Determinar ubicaci�n de procesamiento
    async determineProcessingLocation(operation, context) {
      // Verificar si hay modelo local disponible
      const hasLocalCapability = this.hasLocalModelFor(operation);
      
      // Si no hay capacidad local, usar remoto si disponible
      if (!hasLocalCapability) {
        return this.remoteClient ? 'remote' : null;
      }
      
      // Consideraciones de bater�a
      const resources = await picura.sustainability.getResourceStatus();
      
      // En bater�a muy baja, usar siempre local o ninguno
      if (resources.batteryLevel < 0.15 && !resources.charging) {
        return hasLocalCapability ? 'local' : null;
      }
      
      // Consideraciones de tama�o/complejidad
      const complexity = this.estimateOperationComplexity(operation, context);
      
      // Para operaciones complejas, preferir remoto si est� disponible y no hay restricciones
      if (complexity === 'high' && this.remoteClient && 
          !resources.networkLimited && resources.batteryLevel > 0.5) {
        return 'remote';
      }
      
      // Para complejidad media, decisi�n basada en preferencias y recursos
      if (complexity === 'medium') {
        // Si prefiere local o hay restricciones de red, usar local
        if (this.processingPreferences.preferLocal || resources.networkLimited) {
          return 'local';
        }
        
        // Si est� cargando o tiene buena bater�a, puede usar remoto
        if (resources.charging || resources.batteryLevel > 0.5) {
          return this.remoteClient ? 'remote' : 'local';
        }
        
        // En otros casos, local para conservar bater�a/datos
        return 'local';
      }
      
      // Para operaciones simples, siempre local
      return 'local';
    },
    
    // Operaciones de IA
    async processText(text, operation, context = {}) {
      // Determinar ubicaci�n de procesamiento
      const location = await this.determineProcessingLocation(operation, {
        text,
        ...context
      });
      
      if (!location) {
        throw new Error(`No hay capacidad disponible para la operaci�n: ${operation}`);
      }
      
      // Ejecutar procesamiento seg�n ubicaci�n
      if (location === 'local') {
        return this.processLocally(text, operation, context);
      } else {
        return this.processRemotely(text, operation, context);
      }
    },
    
    // Procesar localmente
    async processLocally(text, operation, context) {
      // Obtener modelo local apropiado
      const model = this.getLocalModel(operation);
      
      if (!model) {
        throw new Error(`No se encontr� modelo local para: ${operation}`);
      }
      
      // Adaptar par�metros seg�n recursos
      const resources = await picura.sustainability.getResourceStatus();
      const params = this.adaptParamsToResources(context, resources);
      
      // Ejecutar inferencia local
      return model.process(text, params);
    },
    
    // Procesar remotamente
    async processRemotely(text, operation, context) {
      if (!this.remoteClient) {
        throw new Error('Servicio remoto no disponible');
      }
      
      // Verificar si el texto contiene informaci�n sensible
      if (this.processingPreferences.privacyLevel === 'high') {
        const hasSensitiveContent = await this.detectSensitiveContent(text);
        if (hasSensitiveContent) {
          throw new Error('El contenido contiene informaci�n potencialmente sensible');
        }
      }
      
      // Preparar solicitud optimizada
      const request = {
        operation,
        content: text,
        parameters: this.optimizeRequestParameters(context),
        modelPreferences: this.processingPreferences.qualityLevel
      };
      
      // Enviar solicitud con gesti�n de errores
      try {
        const result = await this.remoteClient.process(request);
        
        // Cachear resultado para uso futuro
        await this.cacheResult(operation, text, result);
        
        return result;
      } catch (error) {
        // Intentar fallback a procesamiento local si es posible
        if (this.hasLocalModelFor(operation)) {
          console.log('Fallback a procesamiento local:', error.message);
          return this.processLocally(text, operation, context);
        }
        
        throw error;
      }
    },
    
    // Configurar preferencias
    async setProcessingPreferences(preferences) {
      this.processingPreferences = {
        ...this.processingPreferences,
        ...preferences
      };
      
      // Adaptar modelos locales seg�n preferencias
      if (preferences.resourceUsage) {
        await this.adaptLocalModels(preferences.resourceUsage);
      }
      
      return this.processingPreferences;
    }
  };
  
  // Registrar servicio
  await picura.services.registerRemoteService(aiService);
  
  // Configurar seg�n contexto del usuario
  const batteryStatus = await picura.sustainability.getBatteryStatus();
  const networkStatus = await picura.services.getConnectivityStatus();
  
  // Configuraci�n adaptativa inicial
  await picura.services.configureService('sustainable-ai-service', {
    enableRemote: !networkStatus.limited,
    preferLocal: batteryStatus.level < 0.5 || networkStatus.metered,
    qualityLevel: batteryStatus.charging ? 'high' : 'balanced',
    resourceUsage: batteryStatus.level < 0.3 ? 'minimal' : 'balanced'
  });
  
  return aiService;
};
```

## Seguridad y Privacidad

### Protecci�n de Datos

```typescript
// Configuraci�n de protecci�n de datos para servicios remotos
const configureDataProtection = async () => {
  const securityManager = await picura.security.getSecurityManager();
  
  // Configurar pol�ticas de protecci�n de datos
  await securityManager.configureDataProtection({
    // Pol�ticas por tipo de dato
    contentPolicies: {
      // Documentos
      'document': {
        encryption: 'always',
        encryptionAlgorithm: 'aes-256-gcm',
        metadataProtection: 'selective',
        transmissionProtection: 'always',
        remoteStorage: 'user-controlled'
      },
      
      // Metadatos
      'metadata': {
        encryption: 'sensitive-only',
        pseudonymization: true,
        minimization: true
      },
      
      // Configuraci�n de usuario
      'userSettings': {
        encryption: 'always',
        localStorageOnly: 'sensitive',
        syncControl: 'explicit'
      },
      
      // Datos de an�lisis
      'analytics': {
        anonymization: true,
        aggregation: true,
        userControlled: true,
        retentionLimit: '90d'
      }
    },
    
    // Clasificaci�n autom�tica
    contentClassification: {
      enabled: true,
      patterns: [
        { name: 'email', regex: /[\w.-]+@[\w.-]+\.\w+/, sensitivity: 'medium' },
        { name: 'phone', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, sensitivity: 'medium' },
        { name: 'apiKey', regex: /(['"])?\w{32,}\1/, sensitivity: 'high' }
      ],
      aiDetection: {
        enabled: true,
        localOnly: true,
        confidenceThreshold: 0.8
      }
    },
    
    // Control de transmisi�n
    transmissionControl: {
      remoteServiceReview: true,
      domainAllowlist: ['api.picura.org', 'sync.picura.org'],
      dataMinimization: 'aggressive',
      forceTLS: true,
      certificateValidation: 'strict'
    }
  });
  
  // Configurar filtro de privacidad para transmisiones
  await securityManager.configurePrivacyFilter({
    enabled: true,
    
    // Filtros por tipo de contenido
    filters: {
      'document.content': {
        // Eliminar contenido sensible detectado
        removeSensitiveData: true,
        // Tipos de datos a filtrar en tr�nsito
        sensitiveDataTypes: ['personal', 'financial', 'health'],
        // Expresiones regulares personalizadas
        customPatterns: [
          { pattern: /password\s*[:=]\s*['"]?[\w\d!@#$%^&*()-]+['"]?/, replacement: 'password: "[FILTERED]"' }
        ]
      },
      'document.metadata': {
        // Filtrar campos sensibles espec�ficos
        filteredFields: ['author.email', 'privateNotes', 'internalTags'],
        // Psed�nimos para autores
        pseudonymizeAuthors: true
      }
    },
    
    // Configuraci�n de auditor�a
    auditLog: {
      enabled: true,
      logAttempts: true,
      notifyUser: true,
      retentionDays: 30
    }
  });
  
  return securityManager;
};
```

### Aislamiento y Permisos

```typescript
// Configuraci�n de aislamiento y permisos para servicios remotos
const configureServiceSandboxing = async () => {
  const securityManager = await picura.security.getSecurityManager();
  
  // Configurar aislamiento de servicios remotos
  await securityManager.configureSandboxing({
    // Aislamiento por defecto
    defaultPolicy: 'strict',
    
    // Pol�ticas por tipo de servicio
    servicePolicies: {
      // Servicios de sincronizaci�n
      'sync': {
        networkAccess: 'specific-endpoints',
        allowedEndpoints: ['sync.picura.org', '*.github.com', '*.gitlab.com'],
        fileSystemAccess: 'limited',
        allowedPaths: ['${workspace}'],
        resourceLimits: {
          memory: '100MB',
          cpu: 'moderate',
          requests: {
            perMinute: 60,
            burstLimit: 100
          }
        }
      },
      
      // Servicios de IA
      'ai': {
        networkAccess: 'specific-endpoints',
        allowedEndpoints: ['ai.picura.org', 'api.openai.com'],
        fileSystemAccess: 'none',
        allowedDataTypes: ['text', 'metadata'],
        resourceLimits: {
          memory: '200MB',
          cpu: 'adaptive',
          requestSize: '100KB'
        }
      },
      
      // Servicios de colaboraci�n
      'collaboration': {
        networkAccess: 'specific-endpoints',
        allowedEndpoints: ['collab.picura.org'],
        fileSystemAccess: 'none',
        allowedDataTypes: ['document-changes', 'cursor-position', 'presence'],
        resourceLimits: {
          memory: '50MB',
          connections: 5,
          requestFrequency: 'adaptive'
        }
      }
    },
    
    // Permisos requeridos por servicio
    permissionRequirements: {
      'document-sync': [
        { permission: 'storage.read', reason: 'Leer documentos para sincronizar' },
        { permission: 'storage.write', reason: 'Actualizar documentos sincronizados' },
        { permission: 'network.sync', reason: 'Comunicaci�n con servicios de sincronizaci�n' }
      ],
      'ai-assistant': [
        { permission: 'document.read', reason: 'Analizar contenido para sugerencias' },
        { permission: 'network.ai', reason: 'Comunicaci�n con servicios de IA (opcional)', optional: true }
      ],
      'real-time-collab': [
        { permission: 'document.read', reason: 'Ver documento compartido' },
        { permission: 'document.write', reason: 'Realizar cambios colaborativos' },
        { permission: 'network.collaboration', reason: 'Comunicaci�n con otros colaboradores' }
      ]
    }
  });
  
  // Configurar validaci�n de entrada para servicios remotos
  await securityManager.configureInputValidation({
    enabled: true,
    
    // Validaciones por servicio
    validations: {
      'document-sync': {
        // Validar respuestas de sincronizaci�n
        validateResponses: true,
        // Esquemas para validaci�n
        schemas: {
          'sync.document': { /* esquema JSON para documentos */ },
          'sync.metadata': { /* esquema JSON para metadatos */ }
        },
        // Sanitizaci�n
        sanitizationRules: {
          'document.content': ['html', 'script']
        }
      },
      'ai-assistant': {
        // Validar respuestas de IA
        validateResponses: true,
        // L�mites de tama�o
        sizeLimits: {
          'request': '50KB',
          'response': '200KB'
        },
        // Sanitizaci�n
        sanitizationRules: {
          'ai.suggestion': ['html', 'script', 'link']
        }
      }
    }
  });
  
  return securityManager;
};
```

## Extensibilidad para Servicios Remotos

### Registro de Servicios Personalizados

Los desarrolladores pueden extender las capacidades remotas con servicios personalizados:

```typescript
// Registro de proveedor de servicio remoto personalizado
picura.plugins.register({
  id: 'custom-publishing-service',
  name: 'Servicio de Publicaci�n Personalizado',
  
  activate(context) {
    // Registrar servicio remoto personalizado
    context.remoteServices.register({
      id: 'custom-publisher',
      name: 'Custom Publisher',
      type: 'publishing',
      
      // Initializaci�n
      async initialize(config) {
        this.client = await createPublishingClient({
          endpoint: config.apiEndpoint,
          apiKey: await context.security.getToken('publishing-api'),
          
          // Optimizaciones sostenibles
          optimizations: {
            compression: true,
            cacheResults: true,
            batchUploads: true,
            intelligentRetry: true
          }
        });
        
        // Verificar conexi�n
        const status = await this.client.checkConnection();
        return { connected: status.connected };
      },
      
      // Capacidades
      getCapabilities() {
        return [
          'publish.website',
          'publish.pdf',
          'publish.ebook',
          'analytics.basic'
        ];
      },
      
      // Operaciones de publicaci�n
      async publishDocument(document, format, options = {}) {
        // Adaptar opciones seg�n recursos disponibles
        const adaptedOptions = await this.adaptOptionsToResources(options);
        
        // Preparar documento para publicaci�n
        const preparedDoc = await this.prepareForPublishing(document, format);
        
        // Publicar con optimizaciones
        const result = await this.client.publish(preparedDoc, {
          format,
          ...adaptedOptions
        });
        
        return {
          id: result.id,
          url: result.publicUrl,
          status: result.status,
          analytics: result.analytics
        };
      },
      
      // Adaptabilidad a recursos
      async adaptOptionsToResources(options) {
        const resources = await context.sustainability.getResourceStatus();
        const connectivity = await context.connectivity.getStatus();
        
        // Adaptar seg�n recursos disponibles
        let adapted = { ...options };
        
        if (resources.batteryLevel < 0.3 || connectivity.metered) {
          // Modo de bajo recurso
          adapted.quality = 'optimized';
          adapted.assets = 'compressed';
          adapted.renderOptions = 'minimal';
        } else if (resources.charging || connectivity.type === 'wifi') {
          // Recursos abundantes
          adapted.quality = options.quality || 'high';
          adapted.assets = options.assets || 'standard';
        }
        
        return adapted;
      },
      
      // M�todos espec�ficos de servicio
      async getPublishedVersions(documentId) {
        return this.client.getVersions(documentId);
      },
      
      async unpublish(publishId) {
        return this.client.unpublish(publishId);
      },
      
      // Sostenibilidad
      getResourceUsage() {
        return {
          networkUsage: this.client.getNetworkStats(),
          averageRequestSize: this.client.getAverageRequestSize(),
          compressionRatio: this.client.getCompressionRatio(),
          cacheEfficiency: this.client.getCacheStats().efficiency
        };
      },
      
      // Adaptaci�n a pol�ticas
      async applyResourcePolicy(policyName) {
        switch (policyName) {
          case 'critical':
            // Desactivar todas las operaciones excepto cr�ticas
            await this.client.setOperationMode('critical-only');
            break;
            
          case 'saving':
            // Modo de ahorro con operaciones limitadas
            await this.client.setOperationMode('essential');
            await this.client.setQualityLevel('low');
            break;
            
          case 'normal':
            // Operaci�n normal
            await this.client.setOperationMode('standard');
            await this.client.setQualityLevel('balanced');
            break;
            
          case 'charging':
            // Aprovechamiento m�ximo
            await this.client.setOperationMode('full');
            await this.client.setQualityLevel('high');
            break;
        }
      }
    });
    
    // Registrar comandos para la UI
    context.commands.register('publish.website', async () => {
      const document = await context.documents.getCurrentDocument();
      const publisher = await context.remoteServices.getService('custom-publisher');
      
      // Mostrar di�logo de opciones
      const options = await context.ui.showPublishDialog({
        title: 'Publicar como Sitio Web',
        document: document.title,
        formats: ['website', 'blog', 'documentation'],
        settings: {
          theme: ['light', 'dark', 'auto'],
          layout: ['standard', 'book', 'presentation']
        }
      });
      
      if (options) {
        // Publicar documento
        const result = await publisher.publishDocument(document, 'website', options);
        
        // Mostrar resultado
        context.ui.showNotification({
          message: 'Documento publicado correctamente',
          type: 'success',
          actions: [
            { label: 'Ver sitio', action: () => context.shell.openExternal(result.url) }
          ]
        });
      }
    });
  }
});
```

### Middlewares Personalizados

```typescript
// Registro de middleware para servicios remotos
picura.plugins.register({
  id: 'sustainable-network-middleware',
  name: 'Middleware de Red Sostenible',
  
  activate(context) {
    // Registrar middleware para optimizar comunicaciones de red
    context.remoteServices.registerMiddleware({
      id: 'sustainable-network',
      name: 'Comunicaciones de Red Sostenibles',
      priority: 100, // Alta prioridad para ejecutar temprano
      
      // Procesamiento de solicitudes salientes
      async processRequest(request, next) {
        // Verificar si la solicitud es compresible
        if (this.isCompressibleContent(request)) {
          request.headers['content-encoding'] = 'gzip';
          request.body = await this.compressContent(request.body);
        }
        
        // A�adir metadatos de sostenibilidad para anal�tica
        request.headers['x-sustainability-metrics'] = 'enabled';
        
        // Adaptar par�metros seg�n contexto
        request = await this.adaptRequestToContext(request);
        
        // Continuar con la cadena de middleware
        return next(request);
      },
      
      // Procesamiento de respuestas entrantes
      async processResponse(response, request, next) {
        // Medir eficiencia de transferencia
        await this.recordTransferEfficiency(request, response);
        
        // Decompresi�n si es necesario
        if (response.headers['content-encoding'] === 'gzip') {
          response.body = await this.decompressContent(response.body);
          delete response.headers['content-encoding'];
        }
        
        // Cacheo adaptativo
        if (this.isCacheable(request, response)) {
          await this.cacheResponse(request, response);
        }
        
        // Continuar con la cadena de middleware
        return next(response);
      },
      
      // M�todos internos
      isCompressibleContent(request) {
        const compressibleTypes = ['application/json', 'text/', 'application/xml'];
        return compressibleTypes.some(type => 
          request.headers['content-type']?.includes(type));
      },
      
      async adaptRequestToContext(request) {
        const resources = await context.sustainability.getResourceStatus();
        const network = await context.network.getStatus();
        
        // Adaptaci�n seg�n recursos disponibles
        if (network.metered || resources.batteryLevel < 0.3) {
          // Reducir tama�o de respuestas en redes medidas o bater�a baja
          request.params = {
            ...request.params,
            limit: Math.min(request.params?.limit || 50, 20),
            fields: this.reduceFieldSet(request.params?.fields),
            optimize: 'size'
          };
        }
        
        // Adaptaci�n para redes lentas
        if (network.quality === 'poor') {
          request.timeout = (request.timeout || 30000) * 2; // Duplicar timeout
          request.retries = (request.retries || 3) + 2; // M�s reintentos
        }
        
        return request;
      },
      
      async recordTransferEfficiency(request, response) {
        // Calcular tama�o original vs. transferido
        const originalSize = this.getOriginalSize(response);
        const transferredSize = this.getTransferredSize(response);
        
        // Registrar m�tricas de eficiencia
        if (originalSize && transferredSize) {
          const ratio = originalSize / transferredSize;
          
          await context.sustainability.recordMetric('network.compression', {
            endpoint: new URL(request.url).hostname,
            originalSize,
            transferredSize,
            compressionRatio: ratio,
            savings: originalSize - transferredSize
          });
        }
      }
    });
  }
});
```

## Referencias

- [Arquitectura de Sostenibilidad](../architecture/sustainability-design.md) - Principios de dise�o sostenible
- [Integraci�n con Git](git-integration.md) - Detalles sobre integraci�n con sistemas de control de versiones
- [Puntos de Extensi�n](extension-points.md) - Extensi�n de funcionalidades de Picura MD
- [Sistema de Plugins](plugin-system.md) - Framework completo para extensiones
- [APIs Internas](internal-apis.md) - APIs internas para desarrollo de componentes