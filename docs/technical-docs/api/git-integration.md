# Integración con Git

## Visión General

La integración con Git en Picura MD proporciona capacidades robustas de control de versiones y sincronización, manteniendo los principios de sostenibilidad, procesamiento local y privacidad. Este documento detalla cómo Picura MD se integra con repositorios Git locales y remotos, y cómo los desarrolladores pueden extender esta funcionalidad.

## Arquitectura de Integración Git

### Diagrama de Componentes

```
+------------------------------------------------------------------+
|                                                                  |
|                  INTEGRACIÓN GIT EN PICURA MD                    |
|                                                                  |
| +------------------------+        +-------------------------+    |
| |                        |        |                         |    |
| |  Version Control       |        |  Sync Service           |    |
| |  Service               |        |                         |    |
| |  - Repository Manager  |<------>|  - Remote Manager       |    |
| |  - History Provider    |        |  - Transfer Optimizer   |    |
| |  - Diff Engine         |        |  - Conflict Resolution  |    |
| |  - Branch Manager      |        |  - Scheduling Engine    |    |
| |                        |        |                         |    |
| +------------------------+        +-------------------------+    |
|            ^                                  ^                  |
|            |                                  |                  |
|            v                                  v                  |
| +------------------------+        +-------------------------+    |
| |                        |        |                         |    |
| |  Git Core              |        |  Provider Adapters      |    |
| |  - Isomorphic Git      |        |  - GitHub Adapter       |    |
| |  - Repository Indexer  |<------>|  - GitLab Adapter       |    |
| |  - Object Store        |        |  - Generic Git Adapter  |    |
| |  - Command Manager     |        |  - Authentication       |    |
| |                        |        |                         |    |
| +------------------------+        +-------------------------+    |
|                                                                  |
+------------------------------------------------------------------+
                |                             |
                v                             v
    +---------------------+       +------------------------+
    |                     |       |                        |
    | Storage Service     |       | Remote Repositories    |
    | - Git Objects       |       | - GitHub               |
    | - Metadata          |       | - GitLab               |
    | - Working Directory |       | - Custom Git Servers   |
    |                     |       |                        |
    +---------------------+       +------------------------+
```

### Componentes Clave

#### Version Control Service

Proporciona las APIs de alto nivel para operaciones de control de versiones:

- **Repository Manager**: Gestiona repositorios locales y configuración
- **History Provider**: Consultas e interacción con historial de versiones
- **Diff Engine**: Generación y visualización de diferencias entre versiones
- **Branch Manager**: Gestión de ramas y flujos de trabajo

#### Sync Service

Coordina la sincronización eficiente con repositorios remotos:

- **Remote Manager**: Gestión de conexiones con repositorios remotos
- **Transfer Optimizer**: Optimización de transferencia de datos
- **Conflict Resolution**: Detección y resolución de conflictos
- **Scheduling Engine**: Planificación inteligente de sincronización

#### Git Core

Implementación eficiente de Git optimizada para documentación:

- **Isomorphic Git**: Implementación JavaScript de Git sin dependencias binarias
- **Repository Indexer**: Indexación eficiente del repositorio
- **Object Store**: Almacenamiento optimizado de objetos Git
- **Command Manager**: Implementación de comandos Git con enfoque sostenible

#### Provider Adapters

Adaptadores para diferentes proveedores de repositorios Git:

- **GitHub Adapter**: Optimizado para integración con GitHub
- **GitLab Adapter**: Optimizado para integración con GitLab
- **Generic Git Adapter**: Soporte para servidores Git genéricos
- **Authentication**: Gestión segura de credenciales y tokens

## Modelos de Datos

### Objetos Git Fundamentales

| Objeto | Descripción | Optimizaciones |
|--------|-------------|----------------|
| **Commit** | Instantánea del estado con metadatos | Metadatos enriquecidos, compresión adaptativa |
| **Tree** | Estructura jerárquica de archivos | Caché de árboles frecuentes, carga parcial |
| **Blob** | Contenido versionado | Compresión específica para Markdown, deduplicación |
| **Tag** | Referencia con nombre a commit | Metadatos adicionales para documentación |
| **Reference** | Punteros a commits (ramas) | Referencia con estado de sincronización |

### Extensiones Específicas

Picura MD extiende el modelo Git estándar con:

```typescript
// Metadatos extendidos de commit
interface ExtendedCommitMetadata {
  // Metadatos estándar
  author: { name: string, email: string, timestamp: number };
  committer: { name: string, email: string, timestamp: number };
  message: string;
  
  // Extensiones para documentación
  documentMetadata?: {
    changedDocuments: number;
    totalWords: number;
    impactLevel: 'minor' | 'moderate' | 'major';
    tags?: string[];
    category?: string;
  };
  
  // Metadatos de colaboración
  collaborationMetadata?: {
    session?: string;
    coAuthors?: Array<{ name: string, email: string }>;
    reviewStatus?: 'pending' | 'approved' | 'changes-requested';
  };
  
  // Metadatos de sostenibilidad
  sustainabilityMetadata?: {
    transferSize: number;
    compressionRatio: number;
    processingImpact: 'low' | 'medium' | 'high';
  };
}
```

## API Principal de Git

### Version Control Service API

La API principal para interactuar con funcionalidades de Git:

```typescript
interface IVersionControlService {
  // Inicialización y configuración
  initialize(options?: RepositoryOptions): Promise<RepositoryInfo>;
  getStatus(): RepositoryStatus;
  getConfig(): RepositoryConfig;
  setConfig(config: Partial<RepositoryConfig>): Promise<void>;
  
  // Operaciones básicas
  add(files?: string[], options?: AddOptions): Promise<AddResult>;
  commit(message: string, options?: CommitOptions): Promise<CommitResult>;
  checkout(reference: string, options?: CheckoutOptions): Promise<CheckoutResult>;
  
  // Historial y diferencias
  getHistory(documentId?: string, options?: HistoryOptions): Promise<HistoryResult>;
  getVersion(versionId: string): Promise<DocumentVersion>;
  getDiff(fromVersion: string, toVersion: string, options?: DiffOptions): Promise<DiffResult>;
  
  // Operaciones de rama
  getBranches(): Promise<BranchInfo[]>;
  createBranch(name: string, options?: BranchOptions): Promise<BranchResult>;
  deleteBranch(name: string, options?: DeleteBranchOptions): Promise<boolean>;
  mergeBranch(sourceBranch: string, targetBranch?: string, options?: MergeOptions): Promise<MergeResult>;
  
  // Etiquetas
  getTags(): Promise<TagInfo[]>;
  createTag(name: string, options?: TagOptions): Promise<TagResult>;
  
  // Operaciones avanzadas
  stash(message?: string, options?: StashOptions): Promise<StashResult>;
  applyStash(stashId?: string, options?: ApplyStashOptions): Promise<ApplyStashResult>;
  revertTo(versionId: string, options?: RevertOptions): Promise<RevertResult>;
  cherryPick(commitId: string, options?: CherryPickOptions): Promise<CherryPickResult>;
  
  // Integración con sincronización
  push(remote?: string, options?: PushOptions): Promise<PushResult>;
  pull(remote?: string, options?: PullOptions): Promise<PullResult>;
  fetch(remote?: string, options?: FetchOptions): Promise<FetchResult>;
  
  // Eventos
  on(event: VersionControlEvent, handler: EventHandler): Unsubscribe;
}

// Interfaces para operaciones específicas
interface CommitOptions {
  files?: string[];
  author?: Author;
  allowEmpty?: boolean;
  amend?: boolean;
  signoff?: boolean;
  all?: boolean;
  sustainabilityMetadata?: boolean;
}

interface DiffOptions {
  contextLines?: number;
  ignoreWhitespace?: boolean;
  wordDiff?: boolean;
  format?: DiffFormat;
  includeContent?: boolean;
  maxSize?: number;
}

interface HistoryOptions {
  limit?: number;
  since?: Date | string;
  until?: Date | string;
  author?: string;
  path?: string;
  branch?: string;
  includeContent?: boolean;
  includeStats?: boolean;
}

interface MergeOptions {
  strategy?: MergeStrategy;
  squash?: boolean;
  commitMessage?: string;
  fastForward?: 'auto' | 'only' | 'never';
  allowConflicts?: boolean;
}
```

### Sync Service API para Git

```typescript
interface ISyncService {
  // Configuración
  getRemotes(): Promise<RemoteInfo[]>;
  addRemote(name: string, url: string, options?: RemoteOptions): Promise<boolean>;
  removeRemote(name: string): Promise<boolean>;
  setRemoteConfig(remote: string, config: RemoteConfig): Promise<void>;
  
  // Operaciones de sincronización
  sync(options?: SyncOptions): Promise<SyncResult>;
  push(remote?: string, branch?: string, options?: PushOptions): Promise<PushResult>;
  pull(remote?: string, branch?: string, options?: PullOptions): Promise<PullResult>;
  fetch(remote?: string, options?: FetchOptions): Promise<FetchResult>;
  
  // Estado y planificación
  getStatus(): SyncStatus;
  getSyncSchedule(): SyncSchedule;
  setSyncSchedule(schedule: SyncSchedule): Promise<void>;
  
  // Conflictos
  getConflicts(): Promise<ConflictInfo[]>;
  resolveConflict(path: string, resolution: ConflictResolution): Promise<boolean>;
  abortMerge(): Promise<boolean>;
  
  // Autenticación
  getAuthProviders(): AuthProvider[];
  authenticate(provider: string, options?: AuthOptions): Promise<AuthResult>;
  getAuthStatus(remote?: string): Promise<AuthStatus>;
  
  // Eventos
  on(event: SyncEvent, handler: EventHandler): Unsubscribe;
}

// Interfaces para sincronización
interface SyncOptions {
  mode?: SyncMode;
  remote?: string;
  branches?: string[];
  depth?: number;
  prune?: boolean;
  includeAssets?: boolean;
  conflictStrategy?: ConflictStrategy;
  transferOptimization?: TransferOptimizationLevel;
}

interface ConflictResolution {
  type: 'ours' | 'theirs' | 'merge' | 'custom';
  content?: string;
  markResolved?: boolean;
}

interface SyncSchedule {
  enabled: boolean;
  mode: 'interval' | 'timeOfDay' | 'onEvents';
  interval?: number; // minutos
  times?: string[]; // formato HH:MM
  events?: SyncTriggerEvent[];
  constraints?: {
    networkType?: NetworkType[];
    batteryLevel?: number;
    requireCharging?: boolean;
  };
}
```

## Flujos de Trabajo Principales

### Inicialización de Repositorio

```typescript
// Inicializar repositorio para proyecto
const initializeRepo = async () => {
  // Obtener servicio de control de versiones
  const vcs = await picura.services.getVersionControlService();
  
  // Opciones de inicialización con optimizaciones
  const repoInfo = await vcs.initialize({
    path: picura.workspace.rootPath,
    bare: false,
    defaultBranch: 'main',
    createInitialCommit: true,
    initialCommitMessage: 'Initial commit: Project setup',
    
    // Configuraciones específicas para documentación
    gitAttributes: [
      '*.md diff=markdown',
      '*.png binary',
      '*.jpg binary'
    ],
    
    // Optimizaciones de rendimiento
    optimizations: {
      compressionLevel: 'adaptive',
      sharedGitDir: true,
      useGitPromise: false
    },
    
    // Configuración según contexto
    adaptToWorkspace: true
  });
  
  console.log(`Repositorio inicializado: ${repoInfo.path}`);
  console.log(`Branch principal: ${repoInfo.defaultBranch}`);
  
  return repoInfo;
};
```

### Gestión del Historial

```typescript
// Consulta de historial optimizada
const getDocumentHistory = async (documentId) => {
  const vcs = await picura.services.getVersionControlService();
  
  // Verificar recursos para adaptar nivel de detalle
  const resources = await picura.sustainability.getResourceStatus();
  const includeContent = resources.batteryLevel > 0.3;
  const limit = resources.batteryLevel < 0.2 ? 10 : 50;
  
  // Obtener historial con nivel apropiado de detalle
  const history = await vcs.getHistory(documentId, {
    limit,
    includeContent,
    includeStats: resources.batteryLevel > 0.5,
    
    // Otros filtros
    since: '1 month ago',
    branch: 'current',
    
    // Optimizaciones
    cacheResult: true,
    loadStrategy: resources.performance === 'limited' ? 'minimal' : 'balanced'
  });
  
  // Procesar adaptado a condiciones
  if (resources.batteryLevel < 0.15) {
    // Modo de conservación extrema: mostrar solo información crítica
    return history.commits.map(simplifyCommit);
  }
  
  return history;
};

// Comparación de versiones
const compareVersions = async (oldVersionId, newVersionId) => {
  const vcs = await picura.services.getVersionControlService();
  
  // Adaptación a recursos
  const resources = await picura.sustainability.getResourceStatus();
  
  // Configurar nivel de detalle
  const contextLines = resources.batteryLevel < 0.3 ? 2 : 3;
  const wordDiff = resources.batteryLevel > 0.4;
  
  // Obtener diferencias
  const diff = await vcs.getDiff(oldVersionId, newVersionId, {
    contextLines,
    wordDiff,
    ignoreWhitespace: true,
    format: resources.batteryLevel < 0.2 ? 'minimal' : 'standard',
    
    // Optimizaciones
    maxSize: resources.performance === 'limited' ? 100 * 1024 : undefined,
  });
  
  return diff;
};
```

### Sincronización Eficiente

```typescript
// Configuración de sincronización eficiente
const setupEfficientSync = async () => {
  const syncService = await picura.services.getSyncService();
  
  // Configurar programación adaptativa
  await syncService.setSyncSchedule({
    enabled: true,
    mode: 'onEvents',
    events: ['documentSaved', 'applicationIdle', 'networkAvailable'],
    
    // Restricciones de sostenibilidad
    constraints: {
      networkType: ['wifi', 'ethernet'],  // Evitar datos móviles
      batteryLevel: 30,                   // Mínimo 30% de batería
      requireCharging: false              // No requiere estar cargando
    }
  });
  
  // Configurar estrategias de transferencia
  await syncService.setRemoteConfig('origin', {
    transferOptimization: 'adaptive',
    compressionLevel: 'high',
    fetchDepth: 1,                       // Historia superficial para eficiencia
    pruneOnFetch: true,                  // Eliminar referencias obsoletas
    
    // Configuración por tipos de archivo
    pathConfigs: [
      { pattern: '*.md', priority: 'high', diff: 'semantic' },
      { pattern: '*.png', priority: 'low', diff: 'binary' }
    ]
  });
  
  // Configurar manejo de conflictos
  await syncService.setConflictStrategy({
    mode: 'interactive',
    autoResolvable: ['formatting', 'whitespace', 'simple'],
    preferredForNonInteractive: 'ours',
    
    // Optimizaciones de resolución
    diffAlgorithm: 'patience',
    semanticMerge: true
  });
};

// Sincronización bajo demanda
const syncRepository = async () => {
  const syncService = await picura.services.getSyncService();
  
  // Verificar conectividad
  const networkStatus = await picura.network.getStatus();
  if (networkStatus.type === 'none') {
    console.log('Sin conexión, trabajando en modo offline');
    return { success: false, reason: 'offline' };
  }
  
  // Adaptar estrategia según red
  const optimizationLevel = networkStatus.type === 'metered' ? 
    'aggressive' : 'balanced';
  
  // Adaptar según batería
  const resources = await picura.sustainability.getResourceStatus();
  if (resources.batteryLevel < 0.15 && !resources.charging) {
    // Confirmar con usuario en batería baja
    const proceed = await picura.ui.confirm({
      title: 'Batería baja',
      message: 'La sincronización puede consumir energía. ¿Continuar?',
      confirmLabel: 'Sincronizar',
      cancelLabel: 'Postponer'
    });
    
    if (!proceed) {
      return { success: false, reason: 'user-cancelled' };
    }
  }
  
  // Realizar sincronización con optimizaciones
  const result = await syncService.sync({
    mode: 'pull-then-push',
    remote: 'origin',
    branches: ['current'],
    
    // Opciones de sostenibilidad
    transferOptimization: optimizationLevel,
    depth: networkStatus.quality === 'poor' ? 1 : 10,
    
    // Comportamiento
    prune: true,
    includeAssets: resources.batteryLevel > 0.5,
    conflictStrategy: resources.batteryLevel < 0.2 ? 'simple' : 'standard'
  });
  
  // Procesar resultado
  if (result.conflicts.length > 0) {
    // Gestionar conflictos
    await handleConflicts(result.conflicts);
  }
  
  return result;
};
```

### Resolución de Conflictos

```typescript
// Gestión de conflictos adaptativa
const handleConflicts = async (conflicts) => {
  const syncService = await picura.services.getSyncService();
  const resources = await picura.sustainability.getResourceStatus();
  
  // Clasificar conflictos por complejidad
  const simple = conflicts.filter(c => c.complexity === 'simple');
  const moderate = conflicts.filter(c => c.complexity === 'moderate');
  const complex = conflicts.filter(c => c.complexity === 'complex');
  
  // Resolver automáticamente los simples
  for (const conflict of simple) {
    await syncService.resolveConflict(conflict.path, {
      type: 'auto',
      strategy: 'smart-merge'
    });
  }
  
  // En batería baja, sugerir posponer resolución compleja
  if (resources.batteryLevel < 0.2 && complex.length > 0) {
    const postpone = await picura.ui.confirm({
      title: 'Conflictos complejos detectados',
      message: `Hay ${complex.length} conflictos complejos. ¿Resolver más tarde?`,
      confirmLabel: 'Postponer',
      cancelLabel: 'Resolver ahora'
    });
    
    if (postpone) {
      // Guardar estado y salir
      await syncService.storeConflictState();
      return { postponed: true, count: complex.length };
    }
  }
  
  // Resolver resto de conflictos con UI
  const resolutionUI = await picura.ui.openConflictResolver({
    conflicts: [...moderate, ...complex],
    mode: resources.performance === 'limited' ? 'simple' : 'advanced',
    recommendations: true,
    semanticHelp: resources.batteryLevel > 0.3
  });
  
  const result = await resolutionUI.waitForResolution();
  return result;
};
```

## Optimizaciones para Sostenibilidad

### Estrategias de Transferencia Eficiente

Picura MD implementa optimizaciones específicas para minimizar transferencia de datos:

```typescript
// Configuración de optimizaciones de transferencia
syncService.setTransferOptimizations({
  // Compresión adaptativa
  compression: {
    algorithm: 'adaptive', // zlib, zstd, etc. según contexto
    level: 'balanced',     // balanceado para CPU vs. tamaño
    contextAdaptive: true  // ajustar según tipo de contenido
  },
  
  // Estrategias de diferenciación
  diffStrategy: {
    markdown: 'semantic',  // diff semántico para Markdown
    binary: 'smart-binary', // optimizado para binarios
    fallback: 'patience'   // algoritmo patience para otros
  },
  
  // Bundling y transferencia
  transferMode: {
    batchSize: 'adaptive', // tamaño adaptativo por lote
    bundling: true,        // empaquetar operaciones
    compressionFilter: {
      // No comprimir lo ya comprimido
      skipCompressedFormats: true,
      threshold: 1024      // mínimo tamaño para compresión
    }
  },
  
  // Estrategias de red
  networkStrategy: {
    retryStrategy: 'exponential',
    concurrentTransfers: 2,
    timeout: 30000,
    validateConnectivity: true
  }
});
```

### Operaciones Git Eficientes

```typescript
// Optimizaciones específicas de Git
versionControlService.setGitOptimizations({
  // Indexación eficiente
  indexing: {
    incremental: true,
    useCache: true,
    strategy: 'two-phase'
  },
  
  // Objetos Git
  objects: {
    compression: 'zlib-6',
    deduplication: true,
    deltaCompression: true,
    packStrategy: 'efficient-storage'
  },
  
  // Historial y referencias
  history: {
    lazyLoading: true,
    shallowClone: true,
    pruneAggressive: true
  },
  
  // Operaciones específicas para markdown
  markdown: {
    diffAlgorithm: 'semantic-markdown',
    ignoreFormatting: true,
    smartMerge: true
  }
});
```

### Adaptación a Condiciones

```typescript
// Adaptación a recursos disponibles
const determineGitStrategy = async () => {
  const resources = await picura.sustainability.getResourceStatus();
  
  // Estrategia básica según batería
  if (resources.batteryLevel < 0.15) {
    return 'minimal';     // Funcionalidad mínima, conservación extrema
  } else if (resources.batteryLevel < 0.4) {
    return 'conservative'; // Conservación de energía, operaciones básicas
  } else if (resources.charging) {
    return 'performance';  // Máximo rendimiento mientras carga
  } else {
    return 'balanced';     // Balance rendimiento/eficiencia
  }
};

// Aplicar configuración adaptativa
const applyGitStrategy = async (strategy) => {
  const vcs = await picura.services.getVersionControlService();
  
  switch (strategy) {
    case 'minimal':
      await vcs.setConfig({
        autoGC: false,
        fetchDepth: 1,
        historyLimit: 10,
        diffAlgorithm: 'minimal',
        indexMode: 'basic',
        statusMode: 'essential'
      });
      break;
      
    case 'conservative':
      await vcs.setConfig({
        autoGC: true,
        fetchDepth: 5,
        historyLimit: 50,
        diffAlgorithm: 'patience',
        indexMode: 'standard',
        statusMode: 'standard'
      });
      break;
      
    case 'balanced':
      await vcs.setConfig({
        autoGC: true,
        fetchDepth: 50,
        historyLimit: 200,
        diffAlgorithm: 'patience',
        indexMode: 'enhanced',
        statusMode: 'full'
      });
      break;
      
    case 'performance':
      await vcs.setConfig({
        autoGC: true,
        fetchDepth: 0, // completo
        historyLimit: 0, // sin límite
        diffAlgorithm: 'histogram',
        indexMode: 'advanced',
        statusMode: 'full'
      });
      break;
  }
};
```

## Integración con Proveedores Git

### Proveedores Soportados

| Proveedor | Características | Optimizaciones |
|-----------|----------------|----------------|
| **GitHub** | Issues, PRs, Actions | API específica, webhooks, LFS |
| **GitLab** | Merge Requests, CI/CD | API específica, LFS, subgroups |
| **Azure DevOps** | Work Items, Pipelines | API específica, policies |
| **Bitbucket** | Pull Requests, Pipelines | API específica, hooks |
| **Generic Git** | Estándar Git | Protocolos SSH/HTTPS optimizados |

### Implementación de GitHub

```typescript
// Configuración de integración con GitHub
const setupGitHubIntegration = async () => {
  const provider = await picura.git.providers.getProvider('github');
  
  // Autenticación con GitHub
  const authResult = await provider.authenticate({
    method: 'oauth',
    scopes: ['repo'],
    useDeviceFlow: true,
    storeCredentials: true,
    useBrowserIfAvailable: true
  });
  
  if (!authResult.success) {
    throw new Error(`Authentication failed: ${authResult.error}`);
  }
  
  // Configurar integración avanzada
  await provider.configure({
    // Funcionalidades GitHub específicas
    features: {
      issues: true,
      pullRequests: true,
      actions: false,
      projects: false
    },
    
    // Optimización de transferencia
    lfs: {
      enabled: true,
      threshold: 5 * 1024 * 1024, // 5MB
      include: ['*.png', '*.jpg', '*.pdf']
    },
    
    // Sostenibilidad
    optimizations: {
      useRestApi: 'auto',
      useGraphQL: 'when-beneficial',
      cacheStrategy: 'aggressive',
      rateLimitHandling: 'proactive'
    },
    
    // Workflow específico
    workflow: {
      defaultBranchStrategy: 'trunk-based',
      pullRequestFlow: 'enabled',
      autoLinking: true
    }
  });
  
  return provider;
};
```

### Autenticación Segura

```typescript
// Gestión segura de autenticación
const configureGitAuthentication = async (provider, url) => {
  const authManager = await picura.services.getAuthenticationManager();
  
  // Determinar método óptimo según proveedor y URL
  const authMethod = authManager.determineOptimalAuthMethod(provider, url);
  
  switch (authMethod) {
    case 'ssh-key':
      return await configureSshAuthentication(provider);
      
    case 'oauth':
      return await configureOAuthAuthentication(provider);
      
    case 'personal-access-token':
      return await configurePATAuthentication(provider);
      
    case 'basic':
      // Sólo para repos locales o específicos
      return await configureBasicAuthentication(provider);
      
    default:
      throw new Error(`Unsupported authentication method: ${authMethod}`);
  }
};

// Implementación de SSH
const configureSshAuthentication = async (provider) => {
  const keyManager = await picura.security.getSshKeyManager();
  
  // Verificar clave existente
  let key = await keyManager.findKey(provider.url);
  
  if (!key) {
    // Generar nueva clave
    key = await keyManager.generateKey({
      type: 'ed25519',
      comment: `picura-md-${provider.id}-${Date.now()}`,
      passphrase: '' // Sin passphrase para uso automatizado
    });
    
    // Registrar para proveedor
    await keyManager.registerKey(key, provider.url);
    
    // Instrucciones para configurar en servicio remoto
    const instructions = await provider.getKeySetupInstructions(key.publicKey);
    await picura.ui.showKeySetupDialog({
      publicKey: key.publicKey,
      instructions,
      provider: provider.name
    });
  }
  
  return { method: 'ssh', key };
};
```

## Workflows Git Especializados

### Flujo para Documentación

Picura MD implementa workflows específicos para documentación:

```typescript
// Configuración de workflow para documentación
const setupDocumentationWorkflow = async () => {
  const workflowManager = await picura.git.getWorkflowManager();
  
  // Configurar workflow específico para documentación
  await workflowManager.configureWorkflow({
    name: 'documentation-flow',
    
    // Estructura de ramas
    branches: {
      main: {
        name: 'main',
        protected: true,
        description: 'Versión publicada de la documentación'
      },
      develop: {
        name: 'develop',
        description: 'Documentación en desarrollo'
      },
      feature: {
        pattern: 'feature/{name}',
        description: 'Nuevas secciones o características',
        nameValidation: '^[a-z0-9-]+$'
      },
      release: {
        pattern: 'release/v{version}',
        description: 'Preparación de versión'
      }
    },
    
    // Flujos de trabajo
    flows: {
      newSection: {
        name: 'Nueva sección',
        steps: [
          { action: 'createBranch', base: 'develop', pattern: 'feature/{name}' },
          { action: 'editContent' },
          { action: 'commit', message: 'Add {name} section' },
          { action: 'push' },
          { action: 'createPullRequest', base: 'develop', title: 'Add {name} section' }
        ]
      },
      quickFix: {
        name: 'Corrección rápida',
        steps: [
          { action: 'editContent' },
          { action: 'commit', message: 'Fix: {description}' },
          { action: 'push' }
        ]
      },
      release: {
        name: 'Publicar versión',
        steps: [
          { action: 'createBranch', base: 'develop', pattern: 'release/v{version}' },
          { action: 'editReleaseNotes' },
          { action: 'commit', message: 'Prepare release v{version}' },
          { action: 'merge', target: 'main', message: 'Release v{version}' },
          { action: 'createTag', name: 'v{version}', message: 'Version {version}' },
          { action: 'push', pushTags: true }
        ]
      }
    },
    
    // Reglas de commit
    commitRules: {
      messagePattern: '^(feat|fix|docs|style|refactor|perf|test|chore)(\\([\\w-]+\\))?: .+$',
      subjectLength: { max: 72 },
      bodyPattern: '.{0,}',
      requiredFields: {
        body: false,
        footer: false
      }
    },
    
    // Acciones automáticas
    automation: {
      autoStage: true,
      autoPush: false,
      smartCommitMessages: true,
      conflictResolution: 'assisted'
    }
  });
  
  return workflowManager.getWorkflow('documentation-flow');
};
```

### Integración con Ciclo Editorial

```typescript
// Ciclo editorial con revisión
const setupEditorialWorkflow = async () => {
  const editorialWorkflow = await picura.git.workflows.create('editorial');
  
  // Configurar estados de documento
  await editorialWorkflow.configureStates([
    { name: 'draft', color: 'gray', initial: true },
    { name: 'review', color: 'blue' },
    { name: 'approved', color: 'green' },
    { name: 'published', color: 'purple' }
  ]);
  
  // Configurar transiciones
  await editorialWorkflow.configureTransitions([
    { from: 'draft', to: 'review', name: 'Submit for review', 
      action: async (doc) => {
        // Crear branch de revisión
        const branchName = `review/${doc.id}`;
        await editorialWorkflow.git.createBranch(branchName);
        
        // Commit y push
        await editorialWorkflow.git.commit(`Submit ${doc.title} for review`);
        await editorialWorkflow.git.push(branchName);
        
        // Crear PR/MR
        return editorialWorkflow.git.createPullRequest({
          title: `Review: ${doc.title}`,
          body: `Please review this document.\n\n${doc.description}`,
          labels: ['review', doc.category]
        });
      }
    },
    
    { from: 'review', to: 'approved', name: 'Approve',
      action: async (doc, pr) => {
        // Aprobar PR
        await editorialWorkflow.git.approvePullRequest(pr.id);
        
        // Añadir etiqueta
        return editorialWorkflow.git.addPullRequestLabels(pr.id, ['approved']);
      }
    },
    
    { from: 'approved', to: 'published', name: 'Publish',
      action: async (doc, pr) => {
        // Merge PR
        await editorialWorkflow.git.mergePullRequest(pr.id, {
          method: 'squash',
          message: `Publish: ${doc.title}`
        });
        
        // Crear tag de publicación
        const version = await doc.getVersion();
        return editorialWorkflow.git.createTag(`publish/${doc.id}/v${version}`, 
                                           `Published ${doc.title} v${version}`);
      }
    }
  ]);
  
  // Configurar hooks
  await editorialWorkflow.configureHooks({
    onStateChange: async (doc, oldState, newState) => {
      // Actualizar metadatos
      await doc.updateMetadata({
        status: newState,
        lastStateChange: new Date().toISOString()
      });
      
      // Notificar si corresponde
      if (newState === 'review') {
        await picura.notifications.notifyReviewers(doc);
      } else if (newState === 'published') {
        await picura.notifications.notifySubscribers(doc);
      }
    }
  });
  
  return editorialWorkflow;
};
```

## Extensión y Personalización

### Plugins para Git

Los desarrolladores pueden extender las capacidades Git mediante plugins:

```typescript
// Plugin para integrar sistema de tickets
picura.plugins.register({
  id: 'git-ticket-integration',
  name: 'Integración con Sistema de Tickets',
  
  // Activación
  async activate(context) {
    // Registrar proveedor personalizado
    context.git.registerProvider({
      id: 'custom-ticketing',
      name: 'Sistema de Tickets Interno',
      
      // Capacidades
      capabilities: ['issues', 'references', 'metadata'],
      
      // Inicialización
      async initialize() {
        // Conectar con API de tickets
        this.ticketApi = await createTicketAPIClient({
          endpoint: context.configuration.get('ticketSystem.endpoint'),
          authentication: await context.security.getAuthToken('ticket-system')
        });
      },
      
      // Métodos de integración
      async getIssues(filter) {
        return await this.ticketApi.queryIssues(filter);
      },
      
      async createIssueReference(documentId, issueId) {
        // Vincular documento con ticket
        return await this.ticketApi.linkDocumentToIssue(documentId, issueId);
      },
      
      // Hooks de Git
      async onCommit(commit) {
        // Extraer referencias a tickets del mensaje (e.g., #123)
        const ticketRefs = extractTicketReferences(commit.message);
        
        // Actualizar estado de tickets
        for (const ref of ticketRefs) {
          await this.ticketApi.updateIssueStatus(ref, {
            status: 'in-progress',
            comment: `Referenced in commit ${commit.id.substring(0, 8)}`,
            documentRefs: commit.files.filter(f => f.path.endsWith('.md'))
          });
        }
      }
    });
    
    // Registrar comandos
    context.commands.register('tickets.link', async () => {
      const document = await context.documents.getCurrentDocument();
      const tickets = await context.git.providers.get('custom-ticketing').getIssues({status: 'open'});
      
      // Mostrar selector de tickets
      const selected = await context.ui.showQuickPick({
        items: tickets.map(t => ({
          label: `#${t.id}: ${t.title}`,
          description: t.status,
          ticket: t
        })),
        placeholder: 'Seleccionar ticket para vincular'
      });
      
      if (selected) {
        await context.git.providers.get('custom-ticketing')
          .createIssueReference(document.id, selected.ticket.id);
          
        context.ui.showNotification({
          message: `Documento vinculado a ticket #${selected.ticket.id}`,
          type: 'info'
        });
      }
    });
    
    // Añadir UI
    context.ui.statusBar.register({
      id: 'tickets-status',
      position: 'right',
      priority: 10,
      command: 'tickets.showLinked',
      getItem: async () => {
        const document = await context.documents.getCurrentDocument();
        const linkedTickets = await context.git.providers.get('custom-ticketing')
          .getLinkedIssues(document.id);
          
        return {
          text: linkedTickets.length ? `$(issue) ${linkedTickets.length}` : '$(issue)',
          tooltip: `Tickets vinculados: ${linkedTickets.length}`,
          enabled: true
        };
      }
    });
  }
});
```

### Formateo de Commit

```typescript
// Plugin para formateo especializado de commits
picura.plugins.register({
  id: 'semantic-doc-commits',
  name: 'Commits Semánticos para Documentación',
  
  async activate(context) {
    // Registrar formateador personalizado
    context.git.registerCommitFormatter({
      id: 'semantic-docs',
      name: 'Formato Semántico para Docs',
      
      // Generar mensaje de commit
      async formatCommit(changes, options) {
        // Analizar cambios para determinar tipo
        const changeType = await this.classifyChanges(changes);
        
        // Determinar alcance basado en archivos cambiados
        const scope = await this.determineScope(changes);
        
        // Generar prefijo según convención
        let prefix = '';
        switch (changeType) {
          case 'new-content':
            prefix = 'docs(new)';
            break;
          case 'update-content':
            prefix = `docs(${scope})`;
            break;
          case 'fix-typo':
            prefix = `fix(docs)`;
            break;
          case 'reorganize':
            prefix = `refactor(docs)`;
            break;
          default:
            prefix = `docs`;
        }
        
        // Generar descripción concisa
        const description = await this.generateDescription(changes, changeType);
        
        // Formar mensaje completo
        let message = `${prefix}: ${description}`;
        
        // Añadir referencias a tickets si existen
        const ticketRefs = await this.findTicketReferences(changes, options);
        if (ticketRefs.length > 0) {
          message += `\n\nRefs: ${ticketRefs.join(', ')}`;
        }
        
        // Añadir estadísticas si es cambio grande
        if (this.isLargeChange(changes)) {
          const stats = await this.generateChangeStats(changes);
          message += `\n\n${stats}`;
        }
        
        return message;
      },
      
      // Validar mensaje existente
      async validateCommit(message) {
        const pattern = /^(docs|fix|refactor|chore)(\([a-z-]+\))?: .+/;
        const isValid = pattern.test(message);
        
        if (!isValid) {
          return {
            valid: false,
            message: 'El mensaje debe seguir el formato: tipo(alcance): descripción'
          };
        }
        
        return { valid: true };
      },
      
      // Métodos auxiliares
      async classifyChanges(changes) {
        // Lógica para clasificar según contenido modificado
      },
      
      async determineScope(changes) {
        // Determinar alcance basado en archivos y estructura
      }
      
      // Implementación del resto de métodos...
    });
    
    // Registrar como formateador predeterminado para documentos
    context.git.setDefaultCommitFormatter('semantic-docs', {
      filePattern: '**/*.md'
    });
  }
});
```

## Seguridad y Privacidad

### Gestión Segura de Credenciales

```typescript
// Configuración de almacenamiento seguro de credenciales
const configureCredentialStorage = async () => {
  const credManager = await picura.security.getCredentialManager();
  
  // Configurar almacenamiento según plataforma
  await credManager.configure({
    // Usar almacén seguro del sistema
    useSystemKeychain: true,
    
    // Cifrado para almacenamiento local
    encryption: {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2'
    },
    
    // Políticas
    policies: {
      timeout: 3600, // 1 hora
      confirmHighRisk: true,
      memoryOnly: false
    },
    
    // Separación de contextos
    namespaces: {
      git: 'git-credentials',
      remotes: 'remote-access',
      apis: 'api-tokens'
    }
  });
  
  return credManager;
};

// Almacenamiento seguro de token
const storeGitHubToken = async (token, remoteUrl) => {
  const credManager = await picura.security.getCredentialManager();
  
  // Datos a almacenar
  const credential = {
    type: 'oauth2_token',
    token: token.access_token,
    refreshToken: token.refresh_token,
    scopes: token.scope.split(' '),
    expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString()
  };
  
  // Almacenar de forma segura
  await credManager.store({
    namespace: 'git',
    key: `github:${new URL(remoteUrl).hostname}`,
    value: credential,
    // Metadatos para gestión
    metadata: {
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      description: 'GitHub access token for Picura MD'
    }
  });
};
```

### Protección de Información Sensible

```typescript
// Configuración para prevenir filtración de información sensible
const configureSensitiveDataProtection = async () => {
  const gitSecurity = await picura.git.getSecurity();
  
  // Configurar protección contra exposición de datos sensibles
  await gitSecurity.configureSensitiveDataProtection({
    // Patrones a detectar
    patterns: [
      {
        name: 'API Keys',
        regex: /['"]?[A-Za-z0-9_-]{20,}['"]?/,
        contextPattern: /(api[_-]?key|apikey|token)/i,
        severity: 'high'
      },
      {
        name: 'Passwords',
        regex: /['"]?password['"]?\s*[=:]\s*['"].*?['"]/i,
        severity: 'critical'
      },
      {
        name: 'Private Keys',
        regex: /-----BEGIN [A-Z]+ PRIVATE KEY-----/,
        severity: 'critical'
      }
    ],
    
    // Acciones al detectar
    actions: {
      prePush: 'block',
      preCommit: 'warn',
      onScan: 'log'
    },
    
    // Capacidades automáticas
    automation: {
      redactInDiff: true,
      suggestGitignore: true,
      scanHistory: 'on-request'
    }
  });
  
  // Programar escaneo periódico
  await gitSecurity.scheduleSecurityScan({
    frequency: 'weekly',
    scope: 'added-last-month',
    reportLevel: 'summary',
    notifyOnDetection: true
  });
  
  return gitSecurity;
};
```

## Adaptaciones para Casos de Uso Específicos

### Documentación Técnica

```typescript
// Configuración para proyectos de documentación técnica
const setupTechnicalDocumentation = async () => {
  const git = await picura.services.getVersionControlService();
  const sync = await picura.services.getSyncService();
  
  // Configuración especializada
  await git.setConfig({
    // Configuraciones específicas para markdown técnico
    attributesFile: {
      '*.md': 'diff=markdown-technical',
      '*.json': 'diff=json',
      '*.yaml': 'diff=yaml',
      'LICENSE': 'export-ignore',
      'package.json': 'export-ignore'
    },
    
    // Configurar diff driver markdown-technical
    diffDrivers: {
      'markdown-technical': {
        command: 'picura-md-diff --technical --color',
        binary: false,
        cachedPattern: '(^[#]+ .+$|^```|^---$|^- \\[.+\\]|^\\d+\\. )'
      }
    },
    
    // Ignorar elementos auto-generados
    ignore: [
      'node_modules/',
      '.vscode/',
      '_site/',
      '*.log',
      '.DS_Store',
      'dist/'
    ],
    
    // Hooks personalizados
    hooks: {
      'pre-commit': 'picura-hooks/lint-markdown.sh',
      'pre-push': 'picura-hooks/validate-links.sh',
      'post-commit': 'picura-hooks/update-toc.sh'
    }
  });
  
  // Configurar sincronización para documentación técnica
  await sync.setRemoteConfig('origin', {
    // Programación de sincronización
    schedule: {
      mode: 'interval',
      interval: 30, // 30 minutos
      conditions: {
        onDocumentsSaved: true,
        minChanges: 5,
        requireConnectivity: 'any'
      }
    },
    
    // Estrategia de ramas
    branchStrategy: 'topic-branches',
    defaultBranch: 'main',
    
    // Optimizaciones específicas
    optimizations: {
      ignoreGenerated: true,
      ignoreFormatting: true,
      codeBlockStrategy: 'syntax-aware',
      tableStrategy: 'structure-aware'
    }
  });
  
  return {
    git,
    sync,
    workflowType: 'technical-documentation'
  };
};
```

### Publicación de Documentación

```typescript
// Configuración para publicación automatizada
const setupPublishingWorkflow = async () => {
  const gitPublishing = await picura.git.createWorkflow('publishing');
  
  // Configurar workflow de publicación
  await gitPublishing.configure({
    // Estructura de ramas
    branches: {
      source: 'main',
      preview: 'preview',
      production: 'production'
    },
    
    // Entornos de publicación
    environments: {
      preview: {
        url: 'https://preview-docs.example.com',
        deployBranch: 'preview',
        automaticDeploy: true,
        requireApproval: false
      },
      production: {
        url: 'https://docs.example.com',
        deployBranch: 'production',
        automaticDeploy: false,
        requireApproval: true
      }
    },
    
    // Flujos de trabajo
    flows: {
      // Publicación en preview
      previewDeploy: {
        trigger: 'push',
        branch: 'main',
        actions: [
          { step: 'merge', source: 'main', target: 'preview', strategy: 'fast-forward' },
          { step: 'notify', message: 'Preview updated: {commitMessage}', channel: 'team' }
        ]
      },
      
      // Publicación en producción
      productionDeploy: {
        trigger: 'manual',
        requireApproval: true,
        actions: [
          { step: 'verify', checks: ['links', 'images', 'spelling'] },
          { step: 'createRelease', title: 'v{version}', notes: '{releaseNotes}' },
          { step: 'merge', source: 'preview', target: 'production', strategy: 'merge-commit' },
          { step: 'notify', message: 'Production updated to v{version}', channel: 'announcements' }
        ]
      }
    },
    
    // Hooks adicionales
    hooks: {
      preDeploy: async (env, changes) => {
        // Verificaciones pre-publicación
        if (env === 'production') {
          const result = await picura.quality.validateDocumentation(changes);
          if (!result.valid) {
            throw new Error(`Validation failed: ${result.errors.join(', ')}`);
          }
        }
      },
      
      postDeploy: async (env, deployResult) => {
        // Acciones post-publicación
        if (env === 'production') {
          // Actualizar índice de búsqueda
          await picura.search.updatePublicIndex();
          
          // Generar sitemap
          await picura.publishing.generateSitemap(deployResult.url);
          
          // Notificar a sistemas externos
          await picura.integrations.notifyPublished({
            version: deployResult.version,
            url: deployResult.url,
            changes: deployResult.changedFiles
          });
        }
      }
    }
  });
  
  return gitPublishing;
};
```

## Referencias

- [Version Control Service](../components/version-control-service.md): Documentación detallada del componente
- [Sync Service](../components/sync-service.md): Funcionalidades de sincronización
- [Extensión de API](extension-points.md): Extensión de capacidades Git
- [Servicios Remotos](remote-services.md): Integración con servicios externos